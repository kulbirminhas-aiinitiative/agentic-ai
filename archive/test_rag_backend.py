"""
Minimal Test RAG Backend
Bypasses LlamaIndex to test basic connectivity
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from pathlib import Path
import json

app = FastAPI(title="Test RAG Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "status": "running", 
        "message": "Test RAG Backend is working",
        "version": "minimal"
    }

@app.get("/health")
async def health():
    """Health check with environment and file info"""
    
    # Check environment
    env_status = {
        "OPENAI_API_KEY": "SET" if os.getenv("OPENAI_API_KEY") else "NOT SET",
        "PINECONE_API_KEY": "SET" if os.getenv("PINECONE_API_KEY") else "NOT SET",
        "PINECONE_INDEX_NAME": os.getenv("PINECONE_INDEX_NAME", "not-set")
    }
    
    # Check file structure
    file_structure = {}
    agents_dir = Path("data/agents")
    
    if agents_dir.exists():
        for agent_dir in agents_dir.iterdir():
            if agent_dir.is_dir():
                files = [f.name for f in agent_dir.iterdir() if f.is_file()]
                file_structure[agent_dir.name] = {
                    "file_count": len(files),
                    "files": files
                }
    
    return {
        "status": "healthy",
        "environment": env_status,
        "file_structure": file_structure,
        "port": 8000
    }

@app.post("/query/")
async def test_query(request_data: dict):
    """Test query endpoint without LlamaIndex"""
    
    try:
        agent_id = str(request_data.get("agent_id", "unknown"))
        query = request_data.get("query", "")
        
        print(f"📝 Received query for agent {agent_id}: {query}")
        
        # Check if agent has files
        agent_dir = Path("data/agents") / agent_id
        files = []
        
        if agent_dir.exists():
            files = [f.name for f in agent_dir.iterdir() if f.is_file()]
            print(f"📁 Found {len(files)} files for agent {agent_id}: {files}")
        else:
            print(f"📁 No directory found for agent {agent_id}")
        
        if not files:
            response_text = f"I don't have any documents uploaded for Agent {agent_id} yet. Please upload some documents first using the file manager."
            status = "no_documents"
        else:
            response_text = f"[TEST MODE] I can see {len(files)} documents for Agent {agent_id}: {', '.join(files)}. This is a test response since full RAG is not active yet."
            status = "test_mode"
        
        result = {
            "response": response_text,
            "agent_id": agent_id,
            "source": f"agent_{agent_id}",
            "files_available": len(files),
            "files": files,
            "status": status,
            "model": "test-mode",
            "note": "This is a test backend. Full RAG requires LlamaIndex setup."
        }
        
        print(f"✅ Sending response: {result}")
        return result
        
    except Exception as e:
        print(f"❌ Error in query endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Query processing error: {str(e)}")

@app.get("/agent-files/{agent_id}")
async def get_agent_files(agent_id: str):
    """Get list of files for a specific agent"""
    
    agent_dir = Path("data/agents") / agent_id
    
    if agent_dir.exists():
        files = [f.name for f in agent_dir.iterdir() if f.is_file()]
        result = {
            "agent_id": agent_id,
            "files": files,
            "count": len(files),
            "directory": str(agent_dir)
        }
    else:
        result = {
            "agent_id": agent_id,
            "files": [],
            "count": 0,
            "directory": str(agent_dir),
            "status": "directory_not_found"
        }
    
    print(f"📁 Agent {agent_id} files: {result}")
    return result

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Test RAG Backend...")
    print("🌐 Server: http://localhost:8000")
    print("📚 Docs: http://localhost:8000/docs")
    print("💚 Health: http://localhost:8000/health")
    print("🛑 Press Ctrl+C to stop")
    
    try:
        uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {str(e)}")
