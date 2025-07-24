"""
Working RAG Backend for Agent Testing
Enhanced with proper RAG functionality and robust error handling
"""

import os
import json
import traceback
from pathlib import Path
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException, Request, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Try to import RAG components with fallback
try:
    from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
    from llama_index.vector_stores.pinecone import PineconeVectorStore
    from llama_index.llms.openai import OpenAI
    from llama_index.embeddings.openai import OpenAIEmbedding
    from pinecone import Pinecone, ServerlessSpec
    RAG_AVAILABLE = True
    print("✅ RAG components loaded successfully")
except ImportError as e:
    print(f"⚠️ RAG components not available: {e}")
    RAG_AVAILABLE = False

# Load environment variables
load_dotenv()

# Configuration
try:
    from config import MODEL_NAME
except ImportError:
    MODEL_NAME = "gpt-4o"

app = FastAPI(title="Enhanced Working RAG Backend", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for RAG components
agent_indexes: Dict[str, VectorStoreIndex] = {}
pinecone_client = None
pinecone_index = None

def initialize_rag_components():
    """Initialize RAG components if available"""
    global pinecone_client, pinecone_index
    
    if not RAG_AVAILABLE:
        return False
    
    try:
        # Get API keys
        pinecone_api_key = os.getenv("PINECONE_API_KEY")
        openai_api_key = os.getenv("OPENAI_API_KEY")
        
        if not pinecone_api_key or not openai_api_key:
            print("⚠️ API keys not configured properly")
            return False
        
        # Configure LlamaIndex settings
        Settings.llm = OpenAI(model=MODEL_NAME, api_key=openai_api_key)
        Settings.embed_model = OpenAIEmbedding(api_key=openai_api_key)
        
        # Initialize Pinecone
        pinecone_client = Pinecone(api_key=pinecone_api_key)
        index_name = os.getenv("PINECONE_INDEX_NAME", "llamaindex-demo")
        
        # Create index if it doesn't exist
        existing_indexes = pinecone_client.list_indexes().names()
        if index_name not in existing_indexes:
            pinecone_client.create_index(
                name=index_name,
                dimension=1536,
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region="us-east-1")
            )
        
        pinecone_index = pinecone_client.Index(index_name)
        print("✅ RAG components initialized successfully")
        return True
        
    except Exception as e:
        print(f"❌ Failed to initialize RAG components: {e}")
        return False

# Initialize RAG on startup
rag_initialized = initialize_rag_components()

def get_agent_data_directory(agent_id: str) -> Path:
    """Get the data directory for a specific agent"""
    agent_dir = Path("data/agents") / agent_id
    agent_dir.mkdir(parents=True, exist_ok=True)
    return agent_dir

def get_agent_files(agent_id: str) -> List[str]:
    """Get list of files for an agent with robust error handling"""
    try:
        agent_dir = get_agent_data_directory(agent_id)
        if agent_dir.exists() and agent_dir.is_dir():
            files = [f.name for f in agent_dir.iterdir() if f.is_file()]
            print(f"📁 Found {len(files)} files for agent {agent_id}: {files}")
            return files
        else:
            print(f"📁 No directory or not a directory for agent {agent_id}")
            return []
    except Exception as e:
        print(f"❌ Error getting files for agent {agent_id}: {e}")
        return []

def create_agent_index(agent_id: str) -> Optional[VectorStoreIndex]:
    """Create or retrieve agent-specific index"""
    if not rag_initialized:
        return None
        
    cache_key = f"agent_{agent_id}"
    
    # Return cached index if available
    if cache_key in agent_indexes:
        return agent_indexes[cache_key]
    
    try:
        agent_dir = get_agent_data_directory(agent_id)
        files = get_agent_files(agent_id)
        
        if not files:
            print(f"⚠️ No files found for agent {agent_id}")
            return None
        
        # Load documents
        documents = SimpleDirectoryReader(str(agent_dir)).load_data()
        
        if not documents:
            print(f"⚠️ No documents loaded for agent {agent_id}")
            return None
        
        # Create agent-specific vector store
        vector_store = PineconeVectorStore(
            pinecone_index=pinecone_index,
            namespace=f"agent_{agent_id}"
        )
        
        # Create index
        index = VectorStoreIndex.from_documents(
            documents,
            vector_store=vector_store
        )
        
        agent_indexes[cache_key] = index
        print(f"✅ Created index for agent {agent_id} with {len(files)} files: {files}")
        return index
        
    except Exception as e:
        print(f"❌ Error creating index for agent {agent_id}: {e}")
        traceback.print_exc()
        return None

def query_agent_documents(agent_id: str, query: str) -> Dict[str, Any]:
    """Query agent documents with enhanced error handling"""
    files = []  # Initialize files as empty list
    
    try:
        # Get agent files first
        files = get_agent_files(agent_id)
        
        # Ensure files is always a list
        if not isinstance(files, list):
            files = []
        
        if not files:
            return {
                "response": "I don't have any documents uploaded for this agent yet. Please upload some documents first using the file manager, then try your question again.",
                "status": "no_documents",
                "files": [],
                "rag_used": False
            }
        
        # Try RAG if available
        if rag_initialized:
            index = create_agent_index(agent_id)
            
            if index:
                try:
                    query_engine = index.as_query_engine()
                    
                    # Enhanced query with safety checks
                    result = query_engine.query(query)
                    
                    # Check if result is valid
                    if result and hasattr(result, 'response') and result.response:
                        response_text = str(result.response)
                        
                        # Check for empty or generic responses
                        if len(response_text.strip()) > 10 and "I don't have information" not in response_text:
                            return {
                                "response": response_text,
                                "status": "rag_success",
                                "files": files,
                                "rag_used": True,
                                "source_nodes": len(result.source_nodes) if hasattr(result, 'source_nodes') and result.source_nodes else 0
                            }
                    
                except Exception as e:
                    print(f"❌ RAG query failed for agent {agent_id}: {e}")
                    traceback.print_exc()
                    # Fall through to fallback response
            
        # Fallback response when RAG is not available or fails
        # Ensure files is a list before joining
        file_list = ", ".join(files) if isinstance(files, list) and files else "no files"
        
        fallback_response = f"""I can see you have {len(files)} document(s) uploaded: {file_list}. 

I'm ready to analyze these documents for you, but I'm currently running in enhanced fallback mode. This could be because:
- The documents are still being processed
- The RAG system needs additional configuration
- There was an issue accessing the document content

Please try your question again in a moment, or check the server logs for more details."""

        return {
            "response": fallback_response,
            "status": "fallback_mode",
            "files": files if isinstance(files, list) else [],
            "rag_used": False
        }
        
    except Exception as e:
        print(f"❌ Error in query_agent_documents: {e}")
        traceback.print_exc()
        return {
            "response": f"I encountered an error while processing your query. Please try again or contact support if the issue persists.",
            "status": "error",
            "files": files if isinstance(files, list) else [],
            "rag_used": False,
            "error": str(e)
        }

@app.get("/")
async def root():
    return {
        "status": "running", 
        "message": "Enhanced Working RAG Backend is operational",
        "version": "2.0.0",
        "rag_available": RAG_AVAILABLE,
        "rag_initialized": rag_initialized,
        "endpoints": ["/health", "/query", "/agent-files/{agent_id}", "/process-agent-file"]
    }

@app.get("/health")
async def health():
    """Comprehensive health check with RAG status"""
    
    # Check environment variables
    env_status = {
        "OPENAI_API_KEY": "SET" if os.getenv("OPENAI_API_KEY") else "NOT SET",
        "PINECONE_API_KEY": "SET" if os.getenv("PINECONE_API_KEY") else "NOT SET",
        "PINECONE_INDEX_NAME": os.getenv("PINECONE_INDEX_NAME", "not-set")
    }
    
    # RAG system status
    rag_status = {
        "components_available": RAG_AVAILABLE,
        "initialized": rag_initialized,
        "active_indexes": len(agent_indexes),
        "pinecone_connected": pinecone_index is not None
    }
    
    # Check file structure
    file_structure = {"agents": {}}
    agents_dir = Path("data/agents")
    
    if agents_dir.exists():
        for agent_dir in agents_dir.iterdir():
            if agent_dir.is_dir():
                files = [f.name for f in agent_dir.iterdir() if f.is_file()]
                file_structure["agents"][agent_dir.name] = {
                    "file_count": len(files),
                    "files": files,
                    "directory": str(agent_dir),
                    "has_index": f"agent_{agent_dir.name}" in agent_indexes
                }
    
    return {
        "status": "healthy",
        "environment": env_status,
        "rag_system": rag_status,
        "file_structure": file_structure,
        "server_info": {
            "port": 8000,
            "host": "localhost",
            "docs": "http://localhost:8000/docs",
            "model": MODEL_NAME
        }
    }

@app.post("/query/")
async def query_endpoint(request: Request):
    """Enhanced query endpoint with proper RAG functionality"""
    
    try:
        # Parse request data
        data = await request.json()
        query = data.get("query", "")
        agent_id = str(data.get("agent_id", "unknown"))
        
        print(f"📝 Query received for agent {agent_id}: '{query[:100]}...'")
        
        if not query.strip():
            raise HTTPException(status_code=400, detail="Empty query provided")
        
        # Query agent documents with enhanced RAG
        result = query_agent_documents(agent_id, query)
        
        # Prepare final response
        response = {
            "response": result["response"],
            "agent_id": agent_id,
            "source": f"agent_{agent_id}",
            "files_available": len(result["files"]),
            "files": result["files"],
            "status": result["status"],
            "model": data.get("model", MODEL_NAME),
            "rag_used": result["rag_used"],
            "enhanced_mode": True
        }
        
        # Add additional metadata if available
        if "source_nodes" in result:
            response["source_nodes"] = result["source_nodes"]
        if "error" in result:
            response["error"] = result["error"]
        
        print(f"✅ Response sent: {response['status']} - RAG: {response['rag_used']} - {len(response['response'])} chars")
        return response
        
    except json.JSONDecodeError:
        print("❌ Invalid JSON in request")
        raise HTTPException(status_code=400, detail="Invalid JSON in request body")
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in query endpoint: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Query processing error: {str(e)}")

@app.get("/agent-files/{agent_id}")
async def get_agent_files_endpoint(agent_id: str):
    """Get files for a specific agent with enhanced error handling"""
    
    try:
        files = get_agent_files(agent_id)  # Use our robust function
        agent_dir = get_agent_data_directory(agent_id)
        
        result = {
            "agent_id": agent_id,
            "files": files,
            "count": len(files),
            "directory": str(agent_dir),
            "status": "found" if files else "no_files"
        }
        
        print(f"📁 Agent {agent_id} files request: {result['count']} files")
        return result
        
    except Exception as e:
        print(f"❌ Error getting agent files for {agent_id}: {e}")
        return {
            "agent_id": agent_id,
            "files": [],
            "count": 0,
            "directory": "unknown",
            "status": "error",
            "error": str(e)
        }

@app.post("/process-agent-file/")
async def process_agent_file(request: Request):
    """Enhanced file processing endpoint"""
    try:
        data = await request.json()
        agent_id = data.get("agent_id")
        
        if not agent_id:
            raise HTTPException(status_code=400, detail="agent_id is required")
        
        # Clear cached index for this agent to force rebuild
        cache_key = f"agent_{agent_id}"
        if cache_key in agent_indexes:
            del agent_indexes[cache_key]
            print(f"🔄 Cleared cached index for agent {agent_id}")
        
        # Get updated file list
        files = get_agent_files(agent_id)
        
        return {
            "status": "processed",
            "agent_id": agent_id,
            "files": files,
            "file_count": len(files),
            "message": f"Agent {agent_id} files updated. Index will be rebuilt on next query.",
            "rag_available": rag_initialized
        }
        
    except Exception as e:
        print(f"❌ Error in process_agent_file: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-file/{agent_id}")
async def upload_file(agent_id: str, file: UploadFile = File(...)):
    """Upload file directly for an agent"""
    try:
        # Ensure agent directory exists
        agent_dir = get_agent_data_directory(agent_id)
        
        # Save uploaded file
        file_path = agent_dir / file.filename
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Clear cached index to force rebuild
        cache_key = f"agent_{agent_id}"
        if cache_key in agent_indexes:
            del agent_indexes[cache_key]
        
        print(f"📁 Uploaded {file.filename} for agent {agent_id}")
        
        return {
            "status": "uploaded",
            "filename": file.filename,
            "agent_id": agent_id,
            "file_path": str(file_path),
            "size": len(content)
        }
        
    except Exception as e:
        print(f"❌ Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/frontend-compatible-files/{agent_id}")
async def get_frontend_compatible_files(agent_id: str):
    """Get files in a format compatible with the frontend AgentFileManager"""
    try:
        files = get_agent_files(agent_id)
        
        # Convert to frontend-compatible format
        compatible_files = []
        for i, filename in enumerate(files):
            agent_dir = get_agent_data_directory(agent_id)
            file_path = agent_dir / filename
            
            if file_path.exists():
                stat = file_path.stat()
                compatible_files.append({
                    "id": i + 1,  # Fake ID for frontend compatibility
                    "agent_id": int(agent_id),
                    "filename": filename,
                    "original_filename": filename,
                    "file_path": str(file_path),
                    "file_size": stat.st_size,
                    "file_type": file_path.suffix.lower(),
                    "mime_type": "application/pdf" if file_path.suffix.lower() == ".pdf" else "text/plain",
                    "upload_status": "uploaded",
                    "processing_status": "processed",
                    "processed_at": stat.st_mtime,
                    "created_at": stat.st_ctime,
                    "updated_at": stat.st_mtime
                })
        
        return {
            "files": compatible_files,
            "source": "enhanced_backend",
            "agent_id": agent_id,
            "message": f"Found {len(compatible_files)} files in file system for agent {agent_id}"
        }
        
    except Exception as e:
        print(f"❌ Error in frontend-compatible endpoint: {e}")
        return {
            "files": [],
            "error": str(e),
            "agent_id": agent_id
        }

@app.delete("/agent-index/{agent_id}")
async def clear_agent_index(agent_id: str):
    """Clear cached index for an agent"""
    cache_key = f"agent_{agent_id}"
    
    if cache_key in agent_indexes:
        del agent_indexes[cache_key]
        return {
            "status": "cleared",
            "agent_id": agent_id,
            "message": f"Index cache cleared for agent {agent_id}"
        }
    else:
        return {
            "status": "not_found",
            "agent_id": agent_id,
            "message": f"No cached index found for agent {agent_id}"
        }

@app.get("/system-status")
async def system_status():
    """Detailed system status"""
    return {
        "rag_available": RAG_AVAILABLE,
        "rag_initialized": rag_initialized,
        "active_indexes": list(agent_indexes.keys()),
        "index_count": len(agent_indexes),
        "model": MODEL_NAME,
        "pinecone_connected": pinecone_index is not None,
        "api_keys_configured": {
            "openai": bool(os.getenv("OPENAI_API_KEY")),
            "pinecone": bool(os.getenv("PINECONE_API_KEY"))
        }
    }

if __name__ == "__main__":
    import uvicorn
    
    print("🚀 Starting Enhanced Working RAG Backend...")
    print("🌐 Server: http://localhost:8000")
    print("📚 API Docs: http://localhost:8000/docs")
    print("💚 Health Check: http://localhost:8000/health")
    print("📊 System Status: http://localhost:8000/system-status")
    print(f"🤖 Model: {MODEL_NAME}")
    print(f"🔧 RAG Available: {RAG_AVAILABLE}")
    print(f"⚡ RAG Initialized: {rag_initialized}")
    print("🛑 Press Ctrl+C to stop")
    print()
    
    try:
        uvicorn.run(
            app, 
            host="0.0.0.0", 
            port=8000, 
            log_level="info",
            access_log=True
        )
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {str(e)}")
