"""
HyDE (Hypothetical Document Embedding) RAG Implementation
Generates a hypothetical context or answer before retrieval. 
This synthetic document is embedded and used to search the database.
"""
import os
import logging
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
import openai
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.vector_stores.pinecone import PineconeVectorStore
from llama_index.embeddings.openai import OpenAIEmbedding
from pinecone import Pinecone, ServerlessSpec

load_dotenv()

class HyDERAG:
    def __init__(self, data_dir: str = 'data'):
        self.data_dir = data_dir
        self.openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.retriever = self._setup_retriever()
        self.embed_model = OpenAIEmbedding()
        self.logger = logging.getLogger(__name__)
        
    def _setup_retriever(self):
        """Initialize the retrieval system"""
        try:
            pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
            index_name = os.getenv("PINECONE_INDEX_NAME", "hyde-rag-index")
            
            if index_name not in pc.list_indexes().names():
                pc.create_index(
                    name=index_name,
                    dimension=1536,
                    metric="cosine",
                    spec=ServerlessSpec(
                        cloud="aws",
                        region=os.getenv("PINECONE_ENVIRONMENT", "us-east-1")
                    )
                )
            
            pinecone_index = pc.Index(index_name)
            vector_store = PineconeVectorStore(pinecone_index=pinecone_index)
            embed_model = OpenAIEmbedding()
            
            documents = SimpleDirectoryReader(self.data_dir).load_data()
            index = VectorStoreIndex.from_documents(
                documents, 
                vector_store=vector_store, 
                embed_model=embed_model
            )
            
            return index.as_retriever(similarity_top_k=8)
            
        except Exception as e:
            self.logger.error(f"Error setting up retriever: {e}")
            raise
    
    def _generate_hypothetical_document(self, query: str, style: str = "comprehensive") -> str:
        """Generate a hypothetical document that would answer the query"""
        
        style_prompts = {
            "comprehensive": """
            Write a comprehensive, detailed document that would perfectly answer the following question. 
            Include specific facts, examples, and explanations. Write as if you're an expert in the field 
            providing a thorough overview of the topic.
            """,
            "concise": """
            Write a concise but informative document that directly answers the following question.
            Focus on the most important points and key facts.
            """,
            "academic": """
            Write an academic-style document that would answer the following question. 
            Include formal language, structured arguments, and reference to concepts and methodologies.
            """,
            "practical": """
            Write a practical, actionable document that answers the following question.
            Focus on real-world applications, examples, and implementable solutions.
            """
        }
        
        system_prompt = style_prompts.get(style, style_prompts["comprehensive"])
        
        user_prompt = f"""
        Question: {query}
        
        Generate a hypothetical document that would comprehensively answer this question. 
        The document should be well-structured, informative, and contain the type of content 
        that would likely be found in a knowledge base addressing this topic.
        
        Hypothetical Document:
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=1500
            )
            
            hypothetical_doc = response.choices[0].message.content.strip()
            return hypothetical_doc
            
        except Exception as e:
            self.logger.error(f"Error generating hypothetical document: {e}")
            # Fallback: use the query itself as a simple hypothetical document
            return f"This document discusses {query}. It provides comprehensive information about the topic including definitions, examples, and practical applications."
    
    def _generate_multiple_hypotheticals(self, query: str) -> List[str]:
        """Generate multiple hypothetical documents with different styles"""
        styles = ["comprehensive", "concise", "academic", "practical"]
        hypotheticals = []
        
        for style in styles:
            try:
                hyp_doc = self._generate_hypothetical_document(query, style)
                hypotheticals.append({
                    "style": style,
                    "document": hyp_doc,
                    "length": len(hyp_doc)
                })
            except Exception as e:
                self.logger.warning(f"Failed to generate {style} hypothetical: {e}")
        
        return hypotheticals
    
    def _retrieve_with_hypothetical(self, hypothetical_doc: str) -> List[Any]:
        """Retrieve documents using the hypothetical document as query"""
        try:
            # Use the hypothetical document content as the retrieval query
            retrieved_nodes = self.retriever.retrieve(hypothetical_doc)
            return retrieved_nodes
        except Exception as e:
            self.logger.error(f"Error in hypothetical retrieval: {e}")
            return []
    
    def _ensemble_retrieval(self, query: str, hypotheticals: List[Dict]) -> Dict[str, Any]:
        """Perform retrieval using multiple hypothetical documents and ensemble the results"""
        
        all_retrieved = {}  # Dictionary to store unique documents and their scores
        retrieval_details = []
        
        # Also try direct query retrieval for comparison
        try:
            direct_nodes = self.retriever.retrieve(query)
            for node in direct_nodes:
                doc_id = str(hash(node.text[:100]))  # Simple doc ID based on content
                if doc_id not in all_retrieved:
                    all_retrieved[doc_id] = {
                        "node": node,
                        "score": node.score if hasattr(node, 'score') else 0.5,
                        "source": "direct_query",
                        "count": 1
                    }
                else:
                    all_retrieved[doc_id]["count"] += 1
                    all_retrieved[doc_id]["score"] = max(all_retrieved[doc_id]["score"], 
                                                       node.score if hasattr(node, 'score') else 0.5)
        except Exception as e:
            self.logger.warning(f"Direct query retrieval failed: {e}")
        
        # Retrieve using each hypothetical document
        for hyp_info in hypotheticals:
            hyp_doc = hyp_info["document"]
            style = hyp_info["style"]
            
            retrieved_nodes = self._retrieve_with_hypothetical(hyp_doc)
            
            retrieval_info = {
                "style": style,
                "hypothetical_length": len(hyp_doc),
                "retrieved_count": len(retrieved_nodes),
                "retrieved_docs": []
            }
            
            for node in retrieved_nodes:
                doc_id = str(hash(node.text[:100]))
                
                # Store retrieval info
                retrieval_info["retrieved_docs"].append({
                    "doc_id": doc_id,
                    "score": node.score if hasattr(node, 'score') else 0.5,
                    "text_preview": node.text[:200] + "..."
                })
                
                # Add to ensemble
                if doc_id not in all_retrieved:
                    all_retrieved[doc_id] = {
                        "node": node,
                        "score": node.score if hasattr(node, 'score') else 0.5,
                        "source": f"hypothetical_{style}",
                        "count": 1
                    }
                else:
                    all_retrieved[doc_id]["count"] += 1
                    # Boost score for docs retrieved by multiple hypotheticals
                    current_score = node.score if hasattr(node, 'score') else 0.5
                    all_retrieved[doc_id]["score"] = (all_retrieved[doc_id]["score"] + current_score) / 2
                    all_retrieved[doc_id]["source"] += f", hypothetical_{style}"
            
            retrieval_details.append(retrieval_info)
        
        # Sort by composite score (combining retrieval score and frequency)
        ranked_docs = []
        for doc_id, doc_info in all_retrieved.items():
            composite_score = doc_info["score"] * (1 + 0.2 * (doc_info["count"] - 1))  # Boost frequently retrieved docs
            ranked_docs.append({
                "doc_info": doc_info,
                "composite_score": composite_score
            })
        
        ranked_docs.sort(key=lambda x: x["composite_score"], reverse=True)
        
        # Get top documents for context
        top_nodes = [doc["doc_info"]["node"] for doc in ranked_docs[:6]]
        
        return {
            "top_nodes": top_nodes,
            "retrieval_details": retrieval_details,
            "total_unique_docs": len(all_retrieved),
            "ensemble_ranking": [(doc["doc_info"]["source"], doc["composite_score"]) 
                                for doc in ranked_docs[:10]]
        }
    
    def _generate_final_response(self, query: str, context: str, hypotheticals: List[Dict], 
                                retrieval_info: Dict) -> str:
        """Generate the final response using retrieved context and hypothetical insights"""
        
        # Prepare hypothetical summaries
        hyp_summaries = []
        for hyp in hypotheticals:
            summary = hyp["document"][:200] + "..." if len(hyp["document"]) > 200 else hyp["document"]
            hyp_summaries.append(f"- {hyp['style'].title()}: {summary}")
        
        response_prompt = f"""
        You are an AI assistant using the HyDE (Hypothetical Document Embedding) approach. 
        You have generated hypothetical documents and used them to retrieve relevant information.
        
        Original Question: {query}
        
        Hypothetical Documents Generated:
        {chr(10).join(hyp_summaries)}
        
        Retrieved Context:
        {context}
        
        Retrieval Statistics:
        - Total unique documents found: {retrieval_info['total_unique_docs']}
        - Documents retrieved by multiple hypotheticals: {len([r for r in retrieval_info['ensemble_ranking'] if ',' in r[0]])}
        
        Instructions:
        1. Provide a comprehensive answer to the original question using the retrieved context
        2. The hypothetical documents helped guide the retrieval - use this to provide a well-rounded response
        3. If the retrieved context validates or contradicts aspects of the hypothetical documents, mention this
        4. Provide specific examples and details from the retrieved context
        5. Structure your response clearly and make it informative
        
        Response:
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": response_prompt}],
                temperature=0.3
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            self.logger.error(f"Error generating final response: {e}")
            return "I apologize, but I encountered an error while generating the final response."
    
    def query(self, question: str) -> Dict[str, Any]:
        """
        Main query method that implements HyDE RAG
        """
        self.logger.info(f"Starting HyDE RAG query: {question}")
        
        # Generate multiple hypothetical documents
        hypotheticals = self._generate_multiple_hypotheticals(question)
        self.logger.info(f"Generated {len(hypotheticals)} hypothetical documents")
        
        # Perform ensemble retrieval
        retrieval_result = self._ensemble_retrieval(question, hypotheticals)
        
        # Compile context from retrieved documents
        context = "\n\n".join([node.text for node in retrieval_result["top_nodes"]])
        
        # Generate final response
        final_response = self._generate_final_response(
            question, context, hypotheticals, retrieval_result
        )
        
        return {
            "query": question,
            "hypothetical_documents": hypotheticals,
            "retrieval_stats": {
                "total_unique_docs": retrieval_result["total_unique_docs"],
                "ensemble_ranking": retrieval_result["ensemble_ranking"],
                "retrieval_details": retrieval_result["retrieval_details"]
            },
            "context": context,
            "final_response": final_response,
            "hyde_effectiveness": {
                "hypotheticals_generated": len(hypotheticals),
                "docs_retrieved_total": sum(len(detail["retrieved_docs"]) 
                                          for detail in retrieval_result["retrieval_details"]),
                "unique_docs_found": retrieval_result["total_unique_docs"]
            }
        }

def run_hyde_rag_query(query: str, data_dir: str = 'data') -> Dict[str, Any]:
    """
    Run a HyDE RAG query
    
    Args:
        query: The user's question
        data_dir: Directory containing documents for retrieval
    
    Returns:
        Dictionary containing hypotheticals, retrieval info, and final response
    """
    try:
        hyde_rag = HyDERAG(data_dir=data_dir)
        result = hyde_rag.query(query)
        return result
        
    except Exception as e:
        logging.error(f"Error in HyDE RAG query: {e}")
        return {
            "error": str(e),
            "final_response": "I apologize, but I encountered an error while processing your query."
        }

if __name__ == "__main__":
    # Test the HyDE RAG implementation
    logging.basicConfig(level=logging.INFO)
    
    test_query = "What are the best practices for implementing AI in enterprise software development?"
    result = run_hyde_rag_query(test_query)
    
    print("=== HyDE RAG Results ===")
    print(f"Query: {result['query']}")
    
    if 'hyde_effectiveness' in result:
        effectiveness = result['hyde_effectiveness']
        print(f"HyDE Stats:")
        print(f"- Hypotheticals generated: {effectiveness['hypotheticals_generated']}")
        print(f"- Total documents retrieved: {effectiveness['docs_retrieved_total']}")
        print(f"- Unique documents found: {effectiveness['unique_docs_found']}")
    
    print(f"\n=== Hypothetical Documents ===")
    for i, hyp in enumerate(result.get('hypothetical_documents', []), 1):
        print(f"{i}. {hyp['style'].title()} Style ({hyp['length']} chars):")
        preview = hyp['document'][:150] + "..." if len(hyp['document']) > 150 else hyp['document']
        print(f"   {preview}")
    
    print(f"\n=== Final Response ===")
    print(result['final_response'])
