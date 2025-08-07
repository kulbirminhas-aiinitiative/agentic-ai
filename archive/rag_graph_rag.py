"""
Graph RAG Implementation
Uses graph databases to model relationships between documents/concepts.
Retrieval considers both semantic similarity and graph structure.
"""
import os
import logging
from typing import List, Dict, Any, Optional, Tuple
from dotenv import load_dotenv
import openai
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.vector_stores.pinecone import PineconeVectorStore
from llama_index.embeddings.openai import OpenAIEmbedding
from pinecone import Pinecone, ServerlessSpec
import networkx as nx
import json
import re
from sentence_transformers import SentenceTransformer

load_dotenv()

class GraphRAG:
    def __init__(self, data_dir: str = 'data'):
        self.data_dir = data_dir
        self.openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.retriever = self._setup_retriever()
        self.knowledge_graph = self._build_knowledge_graph()
        self.logger = logging.getLogger(__name__)
        
    def _setup_retriever(self):
        """Initialize the vector retrieval system"""
        try:
            pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
            index_name = os.getenv("PINECONE_INDEX_NAME", "graph-rag-index")
            
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
            
            self.documents = documents  # Store for graph building
            return index.as_retriever(similarity_top_k=10)
            
        except Exception as e:
            self.logger.error(f"Error setting up retriever: {e}")
            raise
    
    def _extract_entities_and_relations(self, text: str) -> Dict[str, Any]:
        """Extract entities and relationships from text using LLM"""
        extraction_prompt = f"""
        Extract entities and relationships from the following text. Focus on important nouns, concepts, people, organizations, and their relationships.
        
        Text: {text[:2000]}...
        
        Return the result in JSON format:
        {{
            "entities": [
                {{"name": "entity_name", "type": "PERSON/ORGANIZATION/CONCEPT/LOCATION", "description": "brief description"}}
            ],
            "relationships": [
                {{"source": "entity1", "target": "entity2", "relation": "relationship_type", "description": "brief description"}}
            ]
        }}
        
        Focus on the most important entities and relationships. Limit to top 10 entities and 10 relationships.
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": extraction_prompt}],
                temperature=0.1
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            self.logger.warning(f"Error extracting entities/relations: {e}")
            # Fallback: simple entity extraction using regex
            entities = []
            # Extract capitalized words as potential entities
            potential_entities = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', text)
            for entity in set(potential_entities[:10]):  # Limit to 10 unique entities
                entities.append({
                    "name": entity,
                    "type": "CONCEPT",
                    "description": f"Entity extracted from text: {entity}"
                })
            
            return {
                "entities": entities,
                "relationships": []
            }
    
    def _build_knowledge_graph(self) -> nx.Graph:
        """Build a knowledge graph from the documents"""
        self.logger.info("Building knowledge graph from documents...")
        
        graph = nx.Graph()
        
        for i, doc in enumerate(self.documents):
            self.logger.info(f"Processing document {i+1}/{len(self.documents)}")
            
            # Extract entities and relationships
            extracted = self._extract_entities_and_relations(doc.text)
            
            # Add document node
            doc_id = f"doc_{i}"
            graph.add_node(doc_id, 
                          type="DOCUMENT", 
                          text=doc.text[:500],  # Store first 500 chars
                          full_text=doc.text,
                          embedding=self.embedding_model.encode(doc.text).tolist())
            
            # Add entities
            for entity in extracted.get("entities", []):
                entity_name = entity["name"]
                if not graph.has_node(entity_name):
                    graph.add_node(entity_name,
                                 type=entity["type"],
                                 description=entity["description"],
                                 embedding=self.embedding_model.encode(entity["name"]).tolist())
                
                # Connect entity to document
                graph.add_edge(doc_id, entity_name, relation="CONTAINS")
            
            # Add relationships
            for relation in extracted.get("relationships", []):
                source = relation["source"]
                target = relation["target"]
                
                # Ensure nodes exist
                if not graph.has_node(source):
                    graph.add_node(source, type="CONCEPT", description="Auto-added entity",
                                 embedding=self.embedding_model.encode(source).tolist())
                if not graph.has_node(target):
                    graph.add_node(target, type="CONCEPT", description="Auto-added entity",
                                 embedding=self.embedding_model.encode(target).tolist())
                
                # Add relationship edge
                graph.add_edge(source, target, 
                             relation=relation["relation"],
                             description=relation.get("description", ""))
        
        self.logger.info(f"Knowledge graph built with {graph.number_of_nodes()} nodes and {graph.number_of_edges()} edges")
        return graph
    
    def _find_graph_neighbors(self, query: str, max_hops: int = 2) -> List[str]:
        """Find relevant nodes in the graph based on query"""
        query_embedding = self.embedding_model.encode(query)
        
        # Find nodes with high semantic similarity to query
        similarities = []
        for node, data in self.knowledge_graph.nodes(data=True):
            if 'embedding' in data:
                node_embedding = data['embedding']
                # Calculate cosine similarity
                similarity = np.dot(query_embedding, node_embedding) / (
                    np.linalg.norm(query_embedding) * np.linalg.norm(node_embedding)
                )
                similarities.append((node, similarity))
        
        # Sort by similarity and get top nodes
        similarities.sort(key=lambda x: x[1], reverse=True)
        seed_nodes = [node for node, sim in similarities[:5] if sim > 0.3]
        
        # Expand to neighbors
        relevant_nodes = set(seed_nodes)
        for seed in seed_nodes:
            # Add direct neighbors
            neighbors = list(self.knowledge_graph.neighbors(seed))
            relevant_nodes.update(neighbors[:3])  # Limit neighbors per seed
            
            # Add second-hop neighbors for high-similarity seeds
            if max_hops > 1:
                for neighbor in neighbors[:2]:
                    second_hop = list(self.knowledge_graph.neighbors(neighbor))
                    relevant_nodes.update(second_hop[:2])
        
        return list(relevant_nodes)
    
    def _get_graph_context(self, relevant_nodes: List[str]) -> str:
        """Extract context from relevant graph nodes"""
        context_parts = []
        
        # Get document nodes
        doc_nodes = [node for node in relevant_nodes 
                    if self.knowledge_graph.nodes[node].get('type') == 'DOCUMENT']
        
        for doc_node in doc_nodes:
            doc_data = self.knowledge_graph.nodes[doc_node]
            context_parts.append(f"Document: {doc_data.get('text', '')}")
        
        # Get entity information
        entity_nodes = [node for node in relevant_nodes 
                       if self.knowledge_graph.nodes[node].get('type') != 'DOCUMENT']
        
        if entity_nodes:
            context_parts.append("\nRelevant Entities and Relationships:")
            for entity in entity_nodes[:10]:  # Limit entities
                entity_data = self.knowledge_graph.nodes[entity]
                context_parts.append(f"- {entity} ({entity_data.get('type', 'UNKNOWN')}): {entity_data.get('description', '')}")
                
                # Add key relationships
                neighbors = list(self.knowledge_graph.neighbors(entity))
                for neighbor in neighbors[:3]:  # Limit relationships per entity
                    edge_data = self.knowledge_graph.get_edge_data(entity, neighbor)
                    relation = edge_data.get('relation', 'RELATED_TO')
                    context_parts.append(f"  → {relation} → {neighbor}")
        
        return "\n".join(context_parts)
    
    def _hybrid_retrieval(self, query: str) -> Tuple[str, str]:
        """Perform hybrid retrieval using both vector similarity and graph traversal"""
        
        # Vector-based retrieval
        vector_nodes = self.retriever.retrieve(query)
        vector_context = "\n\n".join([node.text for node in vector_nodes[:5]])
        
        # Graph-based retrieval
        relevant_graph_nodes = self._find_graph_neighbors(query)
        graph_context = self._get_graph_context(relevant_graph_nodes)
        
        return vector_context, graph_context
    
    def query(self, question: str) -> Dict[str, Any]:
        """
        Main query method that implements graph-enhanced RAG
        """
        self.logger.info(f"Starting Graph RAG query: {question}")
        
        # Perform hybrid retrieval
        vector_context, graph_context = self._hybrid_retrieval(question)
        
        # Combine contexts
        combined_context = f"""
        === Vector-based Context ===
        {vector_context}
        
        === Graph-based Context ===
        {graph_context}
        """
        
        # Generate response using combined context
        response_prompt = f"""
        You are an AI assistant that provides comprehensive answers by combining information from both semantic similarity and knowledge graph relationships.
        
        Question: {question}
        
        Context from vector similarity search:
        {vector_context[:2000]}
        
        Context from knowledge graph:
        {graph_context[:2000]}
        
        Instructions:
        1. Use information from both contexts to provide a comprehensive answer
        2. Pay attention to relationships and connections revealed by the knowledge graph
        3. If the contexts provide complementary information, synthesize them
        4. If there are conflicts, acknowledge them and explain
        5. Mention how the graph relationships enhance your understanding
        
        Provide a detailed, well-structured response:
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": response_prompt}],
                temperature=0.3
            )
            
            final_response = response.choices[0].message.content
            
        except Exception as e:
            self.logger.error(f"Error generating response: {e}")
            final_response = "I apologize, but I encountered an error while generating the response."
        
        return {
            "query": question,
            "vector_context": vector_context,
            "graph_context": graph_context,
            "combined_context": combined_context,
            "final_response": final_response,
            "graph_stats": {
                "total_nodes": self.knowledge_graph.number_of_nodes(),
                "total_edges": self.knowledge_graph.number_of_edges(),
                "relevant_nodes": len(self._find_graph_neighbors(question))
            }
        }

# Import numpy for similarity calculations
try:
    import numpy as np
except ImportError:
    # Fallback implementation without numpy
    def cosine_similarity_fallback(a, b):
        dot_product = sum(x * y for x, y in zip(a, b))
        norm_a = sum(x * x for x in a) ** 0.5
        norm_b = sum(x * x for x in b) ** 0.5
        return dot_product / (norm_a * norm_b)
    
    # Monkey patch a simple numpy-like interface
    class SimpleNP:
        @staticmethod
        def dot(a, b):
            return sum(x * y for x, y in zip(a, b))
        
        @staticmethod
        def linalg_norm(a):
            return sum(x * x for x in a) ** 0.5
    
    np = SimpleNP()

def run_graph_rag_query(query: str, data_dir: str = 'data') -> Dict[str, Any]:
    """
    Run a Graph RAG query
    
    Args:
        query: The user's question
        data_dir: Directory containing documents for retrieval
    
    Returns:
        Dictionary containing contexts, graph info, and final response
    """
    try:
        graph_rag = GraphRAG(data_dir=data_dir)
        result = graph_rag.query(query)
        return result
        
    except Exception as e:
        logging.error(f"Error in Graph RAG query: {e}")
        return {
            "error": str(e),
            "final_response": "I apologize, but I encountered an error while processing your query."
        }

if __name__ == "__main__":
    # Test the Graph RAG implementation
    logging.basicConfig(level=logging.INFO)
    
    test_query = "How do artificial intelligence and machine learning technologies relate to business automation?"
    result = run_graph_rag_query(test_query)
    
    print("=== Graph RAG Results ===")
    print(f"Query: {result['query']}")
    
    if 'graph_stats' in result:
        stats = result['graph_stats']
        print(f"Graph Stats: {stats['total_nodes']} nodes, {stats['total_edges']} edges")
        print(f"Relevant nodes found: {stats['relevant_nodes']}")
    
    print(f"\n=== Final Response ===")
    print(result['final_response'])
    
    if 'error' not in result:
        print(f"\n=== Graph Context Sample ===")
        print(result['graph_context'][:500] + "..." if len(result['graph_context']) > 500 else result['graph_context'])
