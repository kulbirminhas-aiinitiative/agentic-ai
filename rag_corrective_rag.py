"""
Corrective RAG (CRAG) Implementation
Adds an error-detection module that validates the generated response against reliable sources,
triggering a correction loop if needed.
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
import json
import re

load_dotenv()

class CorrectiveRAG:
    def __init__(self, data_dir: str = 'data', max_corrections: int = 3):
        self.data_dir = data_dir
        self.max_corrections = max_corrections
        self.openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.retriever = self._setup_retriever()
        self.logger = logging.getLogger(__name__)
        
    def _setup_retriever(self):
        """Initialize the retrieval system"""
        try:
            pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
            index_name = os.getenv("PINECONE_INDEX_NAME", "crag-index")
            
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
            
            return index.as_retriever(similarity_top_k=5)
            
        except Exception as e:
            self.logger.error(f"Error setting up retriever: {e}")
            raise
    
    def _generate_initial_response(self, query: str, context: str) -> str:
        """Generate the initial response using retrieved context"""
        response_prompt = f"""
        You are an AI assistant providing accurate information based on the given context.
        
        Question: {query}
        
        Context: {context}
        
        Instructions:
        - Provide a comprehensive answer based on the context
        - Be specific and include relevant details
        - If the context doesn't fully address the question, acknowledge limitations
        - Use clear, professional language
        
        Response:
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": response_prompt}],
                temperature=0.2
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            self.logger.error(f"Error generating initial response: {e}")
            return "I apologize, but I encountered an error while generating the response."
    
    def _detect_errors(self, query: str, response: str, context: str) -> Dict[str, Any]:
        """Detect potential errors in the generated response"""
        
        error_detection_prompt = f"""
        You are an expert error detection system. Analyze the provided response for potential errors, inaccuracies, or issues.
        
        Original Question: {query}
        
        Context Used: {context[:1500]}...
        
        Generated Response: {response}
        
        Analyze the response for the following potential issues:
        1. Factual inaccuracies or contradictions with the context
        2. Missing important information that should be included
        3. Logical inconsistencies or reasoning errors
        4. Misinterpretation of the question
        5. Unsupported claims not backed by the context
        6. Unclear or confusing explanations
        
        Return your analysis in JSON format:
        {{
            "has_errors": true/false,
            "confidence_score": 0.0-1.0,
            "detected_issues": [
                {{
                    "type": "factual_error|missing_info|logical_error|misinterpretation|unsupported_claim|unclear",
                    "description": "Detailed description of the issue",
                    "severity": "high|medium|low",
                    "location": "Specific part of response where issue occurs"
                }}
            ],
            "overall_assessment": "Brief overall assessment",
            "correction_needed": true/false,
            "suggested_improvements": ["improvement 1", "improvement 2"]
        }}
        
        Be thorough but fair in your analysis.
        """
        
        try:
            response_eval = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": error_detection_prompt}],
                temperature=0.1
            )
            
            error_analysis = json.loads(response_eval.choices[0].message.content)
            return error_analysis
            
        except Exception as e:
            self.logger.error(f"Error in error detection: {e}")
            # Return a conservative assessment if error detection fails
            return {
                "has_errors": True,
                "confidence_score": 0.5,
                "detected_issues": [
                    {
                        "type": "system_error",
                        "description": "Error detection system encountered an issue",
                        "severity": "medium",
                        "location": "error detection module"
                    }
                ],
                "overall_assessment": "Unable to complete error analysis",
                "correction_needed": True,
                "suggested_improvements": ["Review response manually", "Verify facts against reliable sources"]
            }
    
    def _validate_against_sources(self, response: str, context: str) -> Dict[str, Any]:
        """Validate response against source material"""
        
        validation_prompt = f"""
        Validate the following response against the provided source context.
        
        Response to validate: {response}
        
        Source context: {context}
        
        Check for:
        1. Claims in the response that are supported by the source context
        2. Claims in the response that contradict the source context
        3. Claims in the response that are not mentioned in the source context
        
        Return validation results in JSON format:
        {{
            "supported_claims": ["claim 1", "claim 2"],
            "contradicted_claims": ["contradicted claim 1"],
            "unsupported_claims": ["unsupported claim 1"],
            "validation_score": 0.0-1.0,
            "needs_correction": true/false,
            "issues_found": ["issue 1", "issue 2"]
        }}
        """
        
        try:
            validation_response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": validation_prompt}],
                temperature=0.1
            )
            
            validation_result = json.loads(validation_response.choices[0].message.content)
            return validation_result
            
        except Exception as e:
            self.logger.error(f"Error in source validation: {e}")
            return {
                "supported_claims": [],
                "contradicted_claims": [],
                "unsupported_claims": [],
                "validation_score": 0.0,
                "needs_correction": True,
                "issues_found": ["Validation system error"]
            }
    
    def _retrieve_correction_context(self, query: str, error_analysis: Dict, current_context: str) -> str:
        """Retrieve additional context for correction based on detected errors"""
        
        # Create targeted queries based on detected issues
        correction_queries = []
        
        for issue in error_analysis.get("detected_issues", []):
            if issue["type"] == "missing_info":
                correction_queries.append(f"{query} {issue['description']}")
            elif issue["type"] == "factual_error":
                correction_queries.append(f"correct information about {issue['location']}")
            elif issue["type"] == "unsupported_claim":
                correction_queries.append(f"evidence for {issue['location']}")
        
        # Add original query with different phrasing
        correction_queries.append(f"comprehensive information about {query}")
        
        # Retrieve additional context
        additional_contexts = []
        for correction_query in correction_queries[:3]:  # Limit to 3 additional queries
            try:
                nodes = self.retriever.retrieve(correction_query)
                additional_contexts.extend([node.text for node in nodes[:2]])
            except Exception as e:
                self.logger.warning(f"Failed to retrieve correction context for '{correction_query}': {e}")
        
        # Combine original and additional context, removing duplicates
        all_context = current_context + "\n\n" + "\n\n".join(additional_contexts)
        
        return all_context
    
    def _generate_corrected_response(self, query: str, original_response: str, 
                                   error_analysis: Dict, enhanced_context: str, 
                                   correction_iteration: int) -> str:
        """Generate a corrected response based on error analysis"""
        
        # Prepare error summary
        error_summary = []
        for issue in error_analysis.get("detected_issues", []):
            error_summary.append(f"- {issue['type']}: {issue['description']}")
        
        correction_prompt = f"""
        You are tasked with correcting a response based on detailed error analysis.
        
        Original Question: {query}
        
        Previous Response (Iteration {correction_iteration}): {original_response}
        
        Detected Issues:
        {chr(10).join(error_summary)}
        
        Enhanced Context: {enhanced_context[:2500]}...
        
        Suggested Improvements:
        {chr(10).join(['- ' + imp for imp in error_analysis.get('suggested_improvements', [])])}
        
        Instructions:
        1. Address each detected issue specifically
        2. Use the enhanced context to provide accurate information
        3. Ensure all claims are supported by the provided context
        4. Maintain clarity and coherence in your response
        5. If you cannot find sufficient information to address an issue, acknowledge this
        6. Provide a comprehensive, accurate response
        
        Corrected Response:
        """
        
        try:
            corrected_response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": correction_prompt}],
                temperature=0.2
            )
            
            return corrected_response.choices[0].message.content
            
        except Exception as e:
            self.logger.error(f"Error generating corrected response: {e}")
            return f"I apologize, but I encountered an error while generating the corrected response (iteration {correction_iteration})."
    
    def query(self, question: str) -> Dict[str, Any]:
        """
        Main query method that implements Corrective RAG with error detection and correction loops
        """
        self.logger.info(f"Starting Corrective RAG query: {question}")
        
        # Initial retrieval
        retrieved_nodes = self.retriever.retrieve(question)
        initial_context = "\n\n".join([node.text for node in retrieved_nodes])
        
        # Generate initial response
        current_response = self._generate_initial_response(question, initial_context)
        
        # Track correction history
        correction_history = []
        current_context = initial_context
        
        for correction_iteration in range(1, self.max_corrections + 1):
            self.logger.info(f"Correction iteration {correction_iteration}")
            
            # Detect errors in current response
            error_analysis = self._detect_errors(question, current_response, current_context)
            
            # Validate against sources
            source_validation = self._validate_against_sources(current_response, current_context)
            
            # Record iteration
            iteration_record = {
                "iteration": correction_iteration,
                "response": current_response,
                "error_analysis": error_analysis,
                "source_validation": source_validation,
                "needs_correction": error_analysis.get("correction_needed", False),
                "confidence_score": error_analysis.get("confidence_score", 0.5),
                "validation_score": source_validation.get("validation_score", 0.5)
            }
            correction_history.append(iteration_record)
            
            # Check if correction is needed
            if not error_analysis.get("correction_needed", True) and source_validation.get("validation_score", 0) > 0.8:
                self.logger.info(f"Response validated after {correction_iteration} iterations")
                break
            
            # If this is the last iteration, don't generate another response
            if correction_iteration >= self.max_corrections:
                self.logger.info(f"Maximum corrections ({self.max_corrections}) reached")
                break
            
            # Retrieve additional context for correction
            enhanced_context = self._retrieve_correction_context(question, error_analysis, current_context)
            
            # Generate corrected response
            current_response = self._generate_corrected_response(
                question, current_response, error_analysis, enhanced_context, correction_iteration
            )
            
            # Update context for next iteration
            current_context = enhanced_context
        
        # Calculate final quality metrics
        final_iteration = correction_history[-1] if correction_history else {}
        final_confidence = final_iteration.get("confidence_score", 0.5)
        final_validation = final_iteration.get("validation_score", 0.5)
        
        return {
            "query": question,
            "final_response": current_response,
            "correction_history": correction_history,
            "total_iterations": len(correction_history),
            "initial_context_length": len(initial_context),
            "final_context_length": len(current_context),
            "quality_metrics": {
                "final_confidence_score": final_confidence,
                "final_validation_score": final_validation,
                "improvement_achieved": len(correction_history) > 1,
                "converged": not final_iteration.get("needs_correction", True)
            },
            "correction_effectiveness": {
                "errors_detected": sum(len(h.get("error_analysis", {}).get("detected_issues", [])) 
                                     for h in correction_history),
                "corrections_applied": len(correction_history) - 1,
                "quality_improvement": (final_confidence + final_validation) / 2
            }
        }

def run_corrective_rag_query(query: str, data_dir: str = 'data', max_corrections: int = 3) -> Dict[str, Any]:
    """
    Run a Corrective RAG query
    
    Args:
        query: The user's question
        data_dir: Directory containing documents for retrieval
        max_corrections: Maximum number of correction iterations
    
    Returns:
        Dictionary containing correction history and final validated response
    """
    try:
        crag = CorrectiveRAG(data_dir=data_dir, max_corrections=max_corrections)
        result = crag.query(query)
        return result
        
    except Exception as e:
        logging.error(f"Error in Corrective RAG query: {e}")
        return {
            "error": str(e),
            "final_response": "I apologize, but I encountered an error while processing your query."
        }

if __name__ == "__main__":
    # Test the Corrective RAG implementation
    logging.basicConfig(level=logging.INFO)
    
    test_query = "What are the key differences between supervised and unsupervised machine learning, and when should each be used?"
    result = run_corrective_rag_query(test_query, max_corrections=2)
    
    print("=== Corrective RAG Results ===")
    print(f"Query: {result['query']}")
    print(f"Total Iterations: {result['total_iterations']}")
    
    if 'quality_metrics' in result:
        metrics = result['quality_metrics']
        print(f"Quality Metrics:")
        print(f"- Final Confidence Score: {metrics['final_confidence_score']:.2f}")
        print(f"- Final Validation Score: {metrics['final_validation_score']:.2f}")
        print(f"- Converged: {metrics['converged']}")
    
    print(f"\n=== Correction History ===")
    for i, iteration in enumerate(result.get('correction_history', []), 1):
        print(f"Iteration {i}:")
        print(f"  Confidence: {iteration['confidence_score']:.2f}")
        print(f"  Validation: {iteration['validation_score']:.2f}")
        print(f"  Issues Detected: {len(iteration['error_analysis'].get('detected_issues', []))}")
        if iteration['error_analysis'].get('detected_issues'):
            for issue in iteration['error_analysis']['detected_issues'][:2]:  # Show first 2 issues
                print(f"    - {issue['type']}: {issue['description'][:100]}...")
    
    print(f"\n=== Final Response ===")
    print(result['final_response'])
