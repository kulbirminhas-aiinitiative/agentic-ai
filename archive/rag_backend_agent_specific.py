import os
from fastapi import FastAPI, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
from llama_index.vector_stores.pinecone import PineconeVectorStore
import pinecone
import shutil
from config import MODEL_NAME
from dotenv import load_dotenv
from typing import Optional, Dict, Any
import json

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "llamaindex-demo")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Pinecone using the new SDK style
from pinecone import Pinecone, ServerlessSpec

pc = Pinecone(api_key=PINECONE_API_KEY)
if PINECONE_INDEX_NAME not in pc.list_indexes().names():
    pc.create_index(
        name=PINECONE_INDEX_NAME,
        dimension=1536,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1")  # Adjust as needed
    )
index = pc.Index(PINECONE_INDEX_NAME)
vector_store = PineconeVectorStore(pinecone_index=index)

# Store agent-specific indexes in memory (in production, use Redis or similar)
agent_indexes: Dict[str, VectorStoreIndex] = {}

def get_agent_data_directory(agent_id: str) -> str:
    """Get the data directory for a specific agent"""
    agent_dir = os.path.join('data', 'agents', agent_id)
    os.makedirs(agent_dir, exist_ok=True)
    return agent_dir

def get_llama_index(agent_id: str = None) -> VectorStoreIndex:
    """Get or create LlamaIndex for specific agent or general data"""
    if agent_id:
        # Agent-specific index
        cache_key = f"agent_{agent_id}"
        
        if cache_key in agent_indexes:
            return agent_indexes[cache_key]
        
        agent_dir = get_agent_data_directory(agent_id)
        
        # Check if agent directory has any actual files (not subdirectories)
        agent_files = []
        if os.path.exists(agent_dir):
            agent_files = [f for f in os.listdir(agent_dir) if os.path.isfile(os.path.join(agent_dir, f))]
        
        if agent_files:
            try:
                documents = SimpleDirectoryReader(agent_dir).load_data()
                # Create agent-specific namespace in Pinecone
                agent_vector_store = PineconeVectorStore(
                    pinecone_index=index, 
                    namespace=f"agent_{agent_id}"
                )
                agent_index = VectorStoreIndex.from_documents(
                    documents, 
                    vector_store=agent_vector_store, 
                    model_name=MODEL_NAME
                )
                agent_indexes[cache_key] = agent_index
                print(f"✅ Created index for agent {agent_id} with {len(agent_files)} files: {agent_files}")
                return agent_index
            except Exception as e:
                print(f"❌ Error creating index for agent {agent_id}: {str(e)}")
                # Fall back to empty index
                agent_vector_store = PineconeVectorStore(
                    pinecone_index=index, 
                    namespace=f"agent_{agent_id}"
                )
                agent_index = VectorStoreIndex([], vector_store=agent_vector_store)
                agent_indexes[cache_key] = agent_index
                return agent_index
        else:
            # No documents for this agent, return empty index
            agent_vector_store = PineconeVectorStore(
                pinecone_index=index, 
                namespace=f"agent_{agent_id}"
            )
            agent_index = VectorStoreIndex([], vector_store=agent_vector_store)
            agent_indexes[cache_key] = agent_index
            return agent_index
    else:
        # General index (backward compatibility)
        # Check for actual files (not directories) in the data folder
        data_files = []
        if os.path.exists('data'):
            data_files = [f for f in os.listdir('data') if os.path.isfile(os.path.join('data', f))]
        
        if data_files:
            documents = SimpleDirectoryReader('data').load_data()
            return VectorStoreIndex.from_documents(documents, vector_store=vector_store, model_name=MODEL_NAME)
        else:
            # No general files, return empty index
            return VectorStoreIndex([], vector_store=vector_store)

@app.post("/process-agent-file/")
async def process_agent_file(agent_id: str = Form(...), file: UploadFile = File(...)):
    """Process file for a specific agent"""
    agent_dir = get_agent_data_directory(agent_id)
    file_path = os.path.join(agent_dir, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Clear cached index for this agent to force rebuild
    cache_key = f"agent_{agent_id}"
    if cache_key in agent_indexes:
        del agent_indexes[cache_key]
    
    # Rebuild index for this agent
    get_llama_index(agent_id)
    
    return {
        "status": "processed", 
        "filename": file.filename, 
        "agent_id": agent_id,
        "model": MODEL_NAME
    }

@app.post("/process-file/")
async def process_file(file: UploadFile = File(...)):
    """Legacy endpoint for general file processing"""
    os.makedirs("data", exist_ok=True)
    file_path = os.path.join("data", file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    # Rebuild general index
    get_llama_index()
    return {"status": "processed", "filename": file.filename, "model": MODEL_NAME}

@app.post("/query/")
async def query_rag(request: Request, query: Optional[str] = Form(None), agent_id: Optional[str] = Form(None)):
    """Query with optional agent-specific context"""
    # Try to get parameters from form or JSON
    if query is None or agent_id is None:
        try:
            data = await request.json()
            if query is None:
                query = data.get("query")
            if agent_id is None:
                agent_id = data.get("agent_id")
        except Exception:
            pass
    
    if not query:
        return {"error": "No query provided."}
    
    # Get appropriate index (agent-specific or general)
    llama_index = get_llama_index(agent_id)
    query_engine = llama_index.as_query_engine()
    
    try:
        response = query_engine.query(query)
        return {
            "response": str(response), 
            "model": MODEL_NAME,
            "agent_id": agent_id,
            "source": f"agent_{agent_id}" if agent_id else "general"
        }
    except Exception as e:
        return {
            "response": f"I don't have specific information about that topic in my knowledge base. This might be because no documents have been uploaded for this agent yet, or the information you're looking for isn't available in the uploaded documents.",
            "model": MODEL_NAME,
            "agent_id": agent_id,
            "source": f"agent_{agent_id}" if agent_id else "general",
            "error": str(e)
        }

@app.get("/agent-files/{agent_id}")
async def get_agent_files(agent_id: str):
    """Get list of files for a specific agent"""
    agent_dir = get_agent_data_directory(agent_id)
    
    if os.path.exists(agent_dir):
        files = [f for f in os.listdir(agent_dir) if os.path.isfile(os.path.join(agent_dir, f))]
        return {"agent_id": agent_id, "files": files, "count": len(files)}
    else:
        return {"agent_id": agent_id, "files": [], "count": 0}

@app.delete("/agent-files/{agent_id}/{filename}")
async def delete_agent_file(agent_id: str, filename: str):
    """Delete a specific file for an agent"""
    agent_dir = get_agent_data_directory(agent_id)
    file_path = os.path.join(agent_dir, filename)
    
    if os.path.exists(file_path):
        os.remove(file_path)
        
        # Clear cached index to force rebuild
        cache_key = f"agent_{agent_id}"
        if cache_key in agent_indexes:
            del agent_indexes[cache_key]
        
        return {"status": "deleted", "filename": filename, "agent_id": agent_id}
    else:
        return {"error": "File not found", "filename": filename, "agent_id": agent_id}

@app.post("/chat")
async def chat_endpoint(request: Request):
    """Chat endpoint with agent-specific context"""
    data = await request.json()
    query = data.get("query")
    agent_id = data.get("agent_id")
    
    if not query:
        return {"error": "No query provided."}
    
    # Use agent-specific query
    return await query_rag(request, query, agent_id)

@app.get("/")
def read_root():
    return {"message": "LlamaIndex FastAPI Backend with Agent-Specific RAG", "model": MODEL_NAME}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
