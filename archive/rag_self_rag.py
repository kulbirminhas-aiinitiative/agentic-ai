"""
Self-RAG Implementation
A system that evaluates its own performance and can generate retrieval queries during generation.
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

class SelfRAG:
    def __init__(self, data_dir: str = 'data', max_iterations: int = 3):
        self.data_dir = data_dir
        self.max_iterations = max_iterations
        self.openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.retriever = self._setup_retriever()
        self.logger = logging.getLogger(__name__)
        
    def _setup_retriever(self):
        """Initialize the retrieval system"""
        try:
            # Setup Pinecone
            pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
            index_name = os.getenv("PINECONE_INDEX_NAME", "selfrag-index")
            
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
            
            # Load documents
            documents = SimpleDirectoryReader(self.data_dir).load_data()
            index = VectorStoreIndex.from_documents(
                documents, 
                vector_store=vector_store, 
                embed_model=embed_model
            )
            
            return index.as_retriever(similarity_top_k=5)
            
        except Exception as e:
            self.logger.error(f"Error setting up retriever: {e}")
            raise
    
    def _evaluate_response_quality(self, question: str, response: str, context: str) -> Dict[str, Any]:
        """Evaluate the quality of a generated response"""
        eval_prompt = f"""
        Evaluate the quality of this response based on the given context.
        
        Question: {question}
        Context: {context}
        Response: {response}
        
        Rate the response on the following criteria (1-5 scale):
        1. Relevance: How well does the response address the question?
        2. Accuracy: How accurate is the information based on the context?
        3. Completeness: How complete is the response?
        4. Coherence: How well-structured and coherent is the response?
        
        Return your evaluation in JSON format:
        {{
            "relevance": score,
            "accuracy": score,
            "completeness": score,
            "coherence": score,
            "overall": average_score,
            "needs_improvement": true/false,
            "improvement_suggestions": ["suggestion1", "suggestion2"]
        }}
        """
        
        try:
            response_eval = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": eval_prompt}],
                temperature=0.1
            )
            
            import json
            evaluation = json.loads(response_eval.choices[0].message.content)
            return evaluation
            
        except Exception as e:
            self.logger.error(f"Error in response evaluation: {e}")
            return {
                "relevance": 3, "accuracy": 3, "completeness": 3, "coherence": 3,
                "overall": 3, "needs_improvement": True,
                "improvement_suggestions": ["Unable to evaluate - system error"]
            }
    
    def _generate_follow_up_query(self, original_query: str, current_response: str, evaluation: Dict) -> str:
        """Generate a follow-up retrieval query based on evaluation"""
        if not evaluation.get("needs_improvement", False):
            return None
            
        suggestions = evaluation.get("improvement_suggestions", [])
        
        follow_up_prompt = f"""
        Based on the evaluation feedback, generate a more specific retrieval query to improve the response.
        
        Original Query: {original_query}
        Current Response: {current_response}
        Issues to Address: {', '.join(suggestions)}
        
        Generate a refined query that would retrieve more relevant information to address these issues.
        Return only the refined query, nothing else.
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": follow_up_prompt}],
                temperature=0.3
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            self.logger.error(f"Error generating follow-up query: {e}")
            return None
    
    def _generate_response(self, query: str, context: str, iteration: int = 1) -> str:
        """Generate response using the retrieved context"""
        system_prompt = f"""
        You are an AI assistant that provides accurate, helpful responses based on the given context.
        
        Instructions:
        - Use only the information provided in the context
        - If the context doesn't contain enough information, acknowledge this
        - Be specific and detailed in your response
        - This is iteration {iteration} of response generation
        """
        
        user_prompt = f"""
        Context: {context}
        
        Question: {query}
        
        Please provide a comprehensive answer based on the context above.
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            self.logger.error(f"Error generating response: {e}")
            return "I apologize, but I encountered an error while generating the response."
    
    def query(self, question: str) -> Dict[str, Any]:
        """
        Main query method that implements self-evaluation and iterative improvement
        """
        self.logger.info(f"Starting Self-RAG query: {question}")
        
        # Track the conversation history
        conversation_history = {
            "original_query": question,
            "iterations": [],
            "final_response": None,
            "total_iterations": 0
        }
        
        current_query = question
        best_response = None
        best_score = 0
        
        for iteration in range(1, self.max_iterations + 1):
            self.logger.info(f"Self-RAG Iteration {iteration}")
            
            # Retrieve relevant documents
            retrieved_nodes = self.retriever.retrieve(current_query)
            context = "\n\n".join([node.text for node in retrieved_nodes])
            
            # Generate response
            response = self._generate_response(current_query, context, iteration)
            
            # Evaluate response quality
            evaluation = self._evaluate_response_quality(question, response, context)
            
            # Track iteration
            iteration_data = {
                "iteration": iteration,
                "query": current_query,
                "response": response,
                "context_length": len(context),
                "evaluation": evaluation,
                "retrieved_chunks": len(retrieved_nodes)
            }
            conversation_history["iterations"].append(iteration_data)
            
            # Check if this is the best response so far
            current_score = evaluation.get("overall", 0)
            if current_score > best_score:
                best_score = current_score
                best_response = response
            
            # If response is good enough, stop iterating
            if not evaluation.get("needs_improvement", True) or current_score >= 4.0:
                self.logger.info(f"Self-RAG converged after {iteration} iterations")
                break
            
            # Generate follow-up query for next iteration
            if iteration < self.max_iterations:
                follow_up_query = self._generate_follow_up_query(question, response, evaluation)
                if follow_up_query:
                    current_query = follow_up_query
                    self.logger.info(f"Generated follow-up query: {follow_up_query}")
                else:
                    self.logger.info("No follow-up query generated, stopping iteration")
                    break
        
        conversation_history["final_response"] = best_response
        conversation_history["total_iterations"] = len(conversation_history["iterations"])
        conversation_history["best_score"] = best_score
        
        return conversation_history

def run_self_rag_query(query: str, data_dir: str = 'data', max_iterations: int = 3) -> Dict[str, Any]:
    """
    Run a Self-RAG query
    
    Args:
        query: The user's question
        data_dir: Directory containing documents for retrieval
        max_iterations: Maximum number of self-evaluation iterations
    
    Returns:
        Dictionary containing the conversation history and final response
    """
    try:
        self_rag = SelfRAG(data_dir=data_dir, max_iterations=max_iterations)
        result = self_rag.query(query)
        return result
        
    except Exception as e:
        logging.error(f"Error in Self-RAG query: {e}")
        return {
            "error": str(e),
            "final_response": "I apologize, but I encountered an error while processing your query."
        }

if __name__ == "__main__":
    # Test the Self-RAG implementation
    logging.basicConfig(level=logging.INFO)
    
    test_query = "What are the main benefits of using artificial intelligence in business?"
    result = run_self_rag_query(test_query)
    
    print("=== Self-RAG Results ===")
    print(f"Original Query: {result['original_query']}")
    print(f"Total Iterations: {result['total_iterations']}")
    print(f"Best Score: {result.get('best_score', 'N/A')}")
    print(f"\nFinal Response: {result['final_response']}")
    
    print("\n=== Iteration Details ===")
    for iteration in result.get('iterations', []):
        print(f"\nIteration {iteration['iteration']}:")
        print(f"Query: {iteration['query']}")
        print(f"Evaluation Score: {iteration['evaluation'].get('overall', 'N/A')}")
        print(f"Needs Improvement: {iteration['evaluation'].get('needs_improvement', 'N/A')}")
