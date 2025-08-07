"""
Agentic RAG Implementation
Model acts as an agent, planning and executing multi-step tasks using retrieved knowledge,
with integration to external tools and function calling.
"""
import os
import json
import logging
from typing import List, Dict, Any, Optional, Callable
from dotenv import load_dotenv
import openai
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.vector_stores.pinecone import PineconeVectorStore
from llama_index.embeddings.openai import OpenAIEmbedding
from pinecone import Pinecone, ServerlessSpec
import requests
from datetime import datetime

load_dotenv()

class AgenticRAG:
    def __init__(self, data_dir: str = 'data'):
        self.data_dir = data_dir
        self.openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.retriever = self._setup_retriever()
        self.logger = logging.getLogger(__name__)
        self.tools = self._setup_tools()
        
    def _setup_retriever(self):
        """Initialize the retrieval system"""
        try:
            pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
            index_name = os.getenv("PINECONE_INDEX_NAME", "agentic-rag-index")
            
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
    
    def _setup_tools(self) -> Dict[str, Dict[str, Any]]:
        """Setup available tools for the agent"""
        return {
            "knowledge_retrieval": {
                "description": "Retrieve relevant information from the knowledge base",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The search query for knowledge retrieval"
                        }
                    },
                    "required": ["query"]
                },
                "function": self._tool_knowledge_retrieval
            },
            "web_search": {
                "description": "Search the web for current information",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The search query for web search"
                        }
                    },
                    "required": ["query"]
                },
                "function": self._tool_web_search
            },
            "calculate": {
                "description": "Perform mathematical calculations",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "expression": {
                            "type": "string",
                            "description": "Mathematical expression to calculate"
                        }
                    },
                    "required": ["expression"]
                },
                "function": self._tool_calculate
            },
            "get_current_time": {
                "description": "Get the current date and time",
                "parameters": {
                    "type": "object",
                    "properties": {},
                    "required": []
                },
                "function": self._tool_get_current_time
            },
            "summarize_text": {
                "description": "Summarize long pieces of text",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "text": {
                            "type": "string",
                            "description": "Text to summarize"
                        },
                        "max_length": {
                            "type": "integer",
                            "description": "Maximum length of summary in words"
                        }
                    },
                    "required": ["text"]
                },
                "function": self._tool_summarize_text
            }
        }
    
    def _tool_knowledge_retrieval(self, query: str) -> Dict[str, Any]:
        """Retrieve information from the knowledge base"""
        try:
            retrieved_nodes = self.retriever.retrieve(query)
            context = "\n\n".join([node.text for node in retrieved_nodes])
            
            return {
                "success": True,
                "content": context,
                "source": "knowledge_base",
                "chunks_retrieved": len(retrieved_nodes)
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "content": "Failed to retrieve from knowledge base"
            }
    
    def _tool_web_search(self, query: str) -> Dict[str, Any]:
        """Simulate web search (in a real implementation, you'd use an actual search API)"""
        # This is a mock implementation - replace with actual web search API
        return {
            "success": True,
            "content": f"Mock web search results for: {query}. In a real implementation, this would fetch current web results.",
            "source": "web_search",
            "note": "This is a mock implementation. Integrate with actual web search API."
        }
    
    def _tool_calculate(self, expression: str) -> Dict[str, Any]:
        """Perform mathematical calculations"""
        try:
            # Safe evaluation of mathematical expressions
            allowed_names = {
                k: v for k, v in __builtins__.items() 
                if k in ['abs', 'round', 'min', 'max', 'sum', 'pow']
            }
            allowed_names.update({
                'pi': 3.14159265359,
                'e': 2.71828182846
            })
            
            result = eval(expression, {"__builtins__": {}}, allowed_names)
            
            return {
                "success": True,
                "result": result,
                "expression": expression,
                "source": "calculator"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "content": f"Failed to calculate: {expression}"
            }
    
    def _tool_get_current_time(self) -> Dict[str, Any]:
        """Get current date and time"""
        try:
            now = datetime.now()
            return {
                "success": True,
                "current_time": now.isoformat(),
                "formatted_time": now.strftime("%Y-%m-%d %H:%M:%S"),
                "source": "system_time"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def _tool_summarize_text(self, text: str, max_length: int = 100) -> Dict[str, Any]:
        """Summarize text using AI"""
        try:
            prompt = f"""
            Summarize the following text in approximately {max_length} words:
            
            {text}
            
            Summary:
            """
            
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=max_length * 2
            )
            
            summary = response.choices[0].message.content.strip()
            
            return {
                "success": True,
                "summary": summary,
                "original_length": len(text.split()),
                "summary_length": len(summary.split()),
                "source": "ai_summarizer"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "content": "Failed to summarize text"
            }
    
    def _create_plan(self, query: str) -> List[Dict[str, Any]]:
        """Create an execution plan for the query"""
        planning_prompt = f"""
        You are an AI planning agent. Given a user query, create a step-by-step plan to answer it.
        
        Available tools:
        - knowledge_retrieval: Search internal knowledge base
        - web_search: Search the web for current information
        - calculate: Perform mathematical calculations
        - get_current_time: Get current date/time
        - summarize_text: Summarize long text
        
        User Query: {query}
        
        Create a plan as a JSON array where each step has:
        - step_number: integer
        - action: tool name to use
        - description: what this step accomplishes
        - parameters: parameters for the tool
        - reasoning: why this step is needed
        
        Return only the JSON array, no other text.
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": planning_prompt}],
                temperature=0.1
            )
            
            plan_json = response.choices[0].message.content.strip()
            plan = json.loads(plan_json)
            
            return plan
            
        except Exception as e:
            self.logger.error(f"Error creating plan: {e}")
            # Fallback plan
            return [
                {
                    "step_number": 1,
                    "action": "knowledge_retrieval",
                    "description": "Search knowledge base for relevant information",
                    "parameters": {"query": query},
                    "reasoning": "Start with internal knowledge base search"
                }
            ]
    
    def _execute_plan(self, plan: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Execute the planned steps"""
        execution_results = []
        
        for step in plan:
            self.logger.info(f"Executing step {step['step_number']}: {step['description']}")
            
            tool_name = step.get('action')
            parameters = step.get('parameters', {})
            
            if tool_name in self.tools:
                tool_function = self.tools[tool_name]['function']
                
                try:
                    result = tool_function(**parameters)
                    execution_results.append({
                        "step": step,
                        "result": result,
                        "success": result.get('success', True)
                    })
                except Exception as e:
                    self.logger.error(f"Error executing step {step['step_number']}: {e}")
                    execution_results.append({
                        "step": step,
                        "result": {"success": False, "error": str(e)},
                        "success": False
                    })
            else:
                self.logger.warning(f"Unknown tool: {tool_name}")
                execution_results.append({
                    "step": step,
                    "result": {"success": False, "error": f"Unknown tool: {tool_name}"},
                    "success": False
                })
        
        return execution_results
    
    def _synthesize_response(self, query: str, plan: List[Dict], execution_results: List[Dict]) -> str:
        """Synthesize final response from execution results"""
        
        # Compile all the information gathered
        gathered_info = []
        for result in execution_results:
            if result['success'] and result['result'].get('success'):
                step_info = {
                    "step": result['step']['description'],
                    "data": result['result']
                }
                gathered_info.append(step_info)
        
        synthesis_prompt = f"""
        You are an AI assistant tasked with providing a comprehensive answer based on the information gathered through multiple steps.
        
        Original Query: {query}
        
        Information Gathered:
        {json.dumps(gathered_info, indent=2)}
        
        Instructions:
        1. Synthesize all the gathered information into a coherent, comprehensive response
        2. Cite sources when appropriate (knowledge_base, web_search, etc.)
        3. If calculations were performed, include the results
        4. If information is missing or incomplete, acknowledge this
        5. Provide a well-structured, helpful answer
        
        Response:
        """
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": synthesis_prompt}],
                temperature=0.3
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            self.logger.error(f"Error synthesizing response: {e}")
            return "I gathered some information but encountered an error while synthesizing the final response."
    
    def query(self, question: str) -> Dict[str, Any]:
        """
        Main query method that implements agentic planning and execution
        """
        self.logger.info(f"Starting Agentic RAG query: {question}")
        
        # Create execution plan
        plan = self._create_plan(question)
        self.logger.info(f"Created plan with {len(plan)} steps")
        
        # Execute the plan
        execution_results = self._execute_plan(plan)
        
        # Synthesize final response
        final_response = self._synthesize_response(question, plan, execution_results)
        
        return {
            "query": question,
            "plan": plan,
            "execution_results": execution_results,
            "final_response": final_response,
            "total_steps": len(plan),
            "successful_steps": sum(1 for r in execution_results if r['success'])
        }

def run_agentic_rag_query(query: str, data_dir: str = 'data') -> Dict[str, Any]:
    """
    Run an Agentic RAG query
    
    Args:
        query: The user's question
        data_dir: Directory containing documents for retrieval
    
    Returns:
        Dictionary containing the plan, execution results, and final response
    """
    try:
        agentic_rag = AgenticRAG(data_dir=data_dir)
        result = agentic_rag.query(query)
        return result
        
    except Exception as e:
        logging.error(f"Error in Agentic RAG query: {e}")
        return {
            "error": str(e),
            "final_response": "I apologize, but I encountered an error while processing your query."
        }

if __name__ == "__main__":
    # Test the Agentic RAG implementation
    logging.basicConfig(level=logging.INFO)
    
    test_query = "What's the current market value of AI companies and how does it relate to the information in our knowledge base about AI adoption?"
    result = run_agentic_rag_query(test_query)
    
    print("=== Agentic RAG Results ===")
    print(f"Query: {result['query']}")
    print(f"Total Steps: {result['total_steps']}")
    print(f"Successful Steps: {result['successful_steps']}")
    
    print("\n=== Execution Plan ===")
    for step in result.get('plan', []):
        print(f"Step {step['step_number']}: {step['description']}")
        print(f"  Tool: {step['action']}")
        print(f"  Reasoning: {step['reasoning']}")
    
    print(f"\n=== Final Response ===")
    print(result['final_response'])
