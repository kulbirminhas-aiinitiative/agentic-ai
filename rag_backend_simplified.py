"""
Simplified RAG Backend - Minimal Version for Testing
This version doesn't use LlamaIndex initially to isolate connection issues
"""

import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from typing import Optional
import json

load_dotenv()

app = FastAPI(title="RAG Backend - Simplified")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "running",
        "message": "Simplified RAG Backend is running",
        "endpoints": ["/docs", "/query", "/agent-files/{agent_id}"]
    }

@app.get("/health")
async def health():
    """Detailed health check"""
    env_vars = {
        "OPENAI_API_KEY": "SET" if os.getenv('OPENAI_API_KEY') else "NOT SET",
        "PINECONE_API_KEY": "SET" if os.getenv('PINECONE_API_KEY') else "NOT SET",
        "PINECONE_INDEX_NAME": os.getenv('PINECONE_INDEX_NAME', 'not-set')
    }
    
    return {
        "status": "healthy",
        "environment": env_vars,
        "data_directory": os.path.exists("data"),
        "agents_directory": os.path.exists("data/agents")
    }

@app.post("/query/")
async def query_rag(request: Request):
    """Simplified query endpoint for testing"""
    try:
        data = await request.json()
        query = data.get("query", "")
        agent_id = data.get("agent_id", "")
        
        # Check if agent has files
        agent_dir = os.path.join("data", "agents", str(agent_id))
        files = []
        if os.path.exists(agent_dir):
            files = [f for f in os.listdir(agent_dir) if os.path.isfile(os.path.join(agent_dir, f))]
        
        if not files:
            return {
                "response": f"I don't have any documents uploaded for Agent {agent_id} yet. Please upload some documents first using the file manager.",
                "agent_id": agent_id,
                "source": f"agent_{agent_id}",
                "files_available": 0,
                "status": "no_documents"
            }
        
        # Simulate a response (since we can't use LlamaIndex yet)
        return {
            "response": f"[Simplified Mode] I can see {len(files)} files for Agent {agent_id}: {', '.join(files)}. However, full RAG functionality is not available yet due to configuration issues. Files found: {files}",
            "agent_id": agent_id, 
            "source": f"agent_{agent_id}",
            "files_available": len(files),
            "files": files,
            "status": "simplified_mode",
            "note": "This is a simplified response. Full RAG requires LlamaIndex setup."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query processing error: {str(e)}")

@app.get("/agent-files/{agent_id}")
async def get_agent_files(agent_id: str):
    """Get list of files for a specific agent"""
    agent_dir = os.path.join("data", "agents", agent_id)
    
    if os.path.exists(agent_dir):
        files = [f for f in os.listdir(agent_dir) if os.path.isfile(os.path.join(agent_dir, f))]
        return {
            "agent_id": agent_id, 
            "files": files, 
            "count": len(files),
            "directory": agent_dir
        }
    else:
        return {
            "agent_id": agent_id, 
            "files": [], 
            "count": 0,
            "directory": agent_dir,
            "status": "directory_not_found"
        }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Simplified RAG Backend...")
    print("🌐 Server: http://localhost:8000")
    print("📚 Docs: http://localhost:8000/docs")
    print("💚 Health: http://localhost:8000/health")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
