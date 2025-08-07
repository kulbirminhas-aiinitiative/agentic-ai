"""
Enhanced RAG Backend with Database Integration
Includes PostgreSQL connectivity and agent management endpoints
"""

import os
import json
import traceback
from pathlib import Path
from typing import Optional, Dict, Any, List
from datetime import datetime

# FastAPI imports
from fastapi import FastAPI, HTTPException, Request, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Database imports
import psycopg2
from psycopg2.extras import RealDictCursor
import sqlalchemy
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Environment and existing imports
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

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://kulbirminhas@localhost:5432/agentic_ai")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Pydantic models
class AgentCreate(BaseModel):
    name: str
    display_name: str
    description: str
    rag_architecture: str = "llamaindex-pinecone"

class AgentResponse(BaseModel):
    id: int
    name: str
    display_name: str
    description: str
    rag_architecture: str
    created_at: datetime
    is_active: bool

class AgentSetting(BaseModel):
    setting_key: str
    setting_value: Any

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize FastAPI app
app = FastAPI(
    title="Agentic AI Platform API",
    description="Enhanced RAG Backend with Database Integration",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for RAG
agent_indexes: Dict[str, VectorStoreIndex] = {}

# Utility functions
def get_agent_data_directory(agent_id: str) -> Path:
    """Get the data directory for a specific agent"""
    base_dir = Path("data/agents")
    agent_dir = base_dir / agent_id
    agent_dir.mkdir(parents=True, exist_ok=True)
    return agent_dir

def get_agent_files(agent_id: str) -> List[str]:
    """Get list of files for a specific agent"""
    agent_dir = get_agent_data_directory(agent_id)
    if not agent_dir.exists():
        return []
    
    files = []
    for file_path in agent_dir.rglob("*"):
        if file_path.is_file():
            files.append(str(file_path.relative_to(agent_dir)))
    
    return files

def test_database_connection():
    """Test database connectivity"""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1 as test"))
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

# Check database connection on startup
if test_database_connection():
    print("✅ Database connected successfully")
else:
    print("❌ Database connection failed")

# API Endpoints

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Agentic AI Platform API v2.0",
        "status": "operational",
        "features": {
            "rag_available": RAG_AVAILABLE,
            "database_connected": test_database_connection(),
            "endpoints": [
                "/agents",
                "/agents/{agent_id}",
                "/agents/{agent_id}/settings",
                "/query",
                "/upload-file/{agent_id}",
                "/health"
            ]
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint with detailed status"""
    db_connected = test_database_connection()
    
    # Check environment variables
    openai_key = bool(os.getenv("OPENAI_API_KEY"))
    pinecone_key = bool(os.getenv("PINECONE_API_KEY"))
    
    return {
        "status": "healthy" if db_connected else "degraded",
        "database": {
            "connected": db_connected,
            "url": DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else "not-configured"
        },
        "environment": {
            "OPENAI_API_KEY": "SET" if openai_key else "NOT SET",
            "PINECONE_API_KEY": "SET" if pinecone_key else "NOT SET"
        },
        "rag_system": {
            "components_available": RAG_AVAILABLE,
            "initialized": len(agent_indexes) > 0,
            "active_indexes": len(agent_indexes)
        }
    }

# Agent Management Endpoints

@app.get("/agents", response_model=List[AgentResponse])
async def get_agents():
    """Get all agents from database"""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("""
                SELECT id, name, display_name, description, rag_architecture, 
                       created_at, is_active 
                FROM agents 
                WHERE is_active = true 
                ORDER BY created_at DESC
            """))
            agents = []
            for row in result:
                agents.append(AgentResponse(
                    id=row.id,
                    name=row.name,
                    display_name=row.display_name,
                    description=row.description,
                    rag_architecture=row.rag_architecture,
                    created_at=row.created_at,
                    is_active=row.is_active
                ))
            return agents
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/agents", response_model=AgentResponse)
async def create_agent(agent: AgentCreate):
    """Create a new agent"""
    try:
        with engine.connect() as connection:
            # Insert new agent
            result = connection.execute(text("""
                INSERT INTO agents (name, display_name, description, rag_architecture)
                VALUES (:name, :display_name, :description, :rag_architecture)
                RETURNING id, name, display_name, description, rag_architecture, created_at, is_active
            """), {
                "name": agent.name,
                "display_name": agent.display_name,
                "description": agent.description,
                "rag_architecture": agent.rag_architecture
            })
            connection.commit()
            
            row = result.fetchone()
            
            # Create agent directory
            get_agent_data_directory(agent.name)
            
            return AgentResponse(
                id=row.id,
                name=row.name,
                display_name=row.display_name,
                description=row.description,
                rag_architecture=row.rag_architecture,
                created_at=row.created_at,
                is_active=row.is_active
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create agent: {str(e)}")

@app.get("/agents/{agent_id}", response_model=AgentResponse)
async def get_agent(agent_id: int):
    """Get a specific agent by ID"""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("""
                SELECT id, name, display_name, description, rag_architecture, 
                       created_at, is_active 
                FROM agents 
                WHERE id = :agent_id AND is_active = true
            """), {"agent_id": agent_id})
            
            row = result.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Agent not found")
            
            return AgentResponse(
                id=row.id,
                name=row.name,
                display_name=row.display_name,
                description=row.description,
                rag_architecture=row.rag_architecture,
                created_at=row.created_at,
                is_active=row.is_active
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/agents/{agent_id}/settings")
async def get_agent_settings(agent_id: int):
    """Get settings for a specific agent"""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("""
                SELECT setting_key, setting_value 
                FROM agent_settings 
                WHERE agent_id = :agent_id 
                ORDER BY setting_key
            """), {"agent_id": agent_id})
            
            settings = {}
            for row in result:
                try:
                    # Handle both string and non-string values
                    if isinstance(row.setting_value, str):
                        settings[row.setting_key] = json.loads(row.setting_value)
                    else:
                        settings[row.setting_key] = row.setting_value
                except (json.JSONDecodeError, TypeError):
                    settings[row.setting_key] = row.setting_value
            
            return {"agent_id": agent_id, "settings": settings}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/agents/{agent_id}/settings")
async def update_agent_settings(agent_id: int, settings: Dict[str, Any]):
    """Update settings for a specific agent"""
    try:
        with engine.connect() as connection:
            # First check if agent exists
            agent_check = connection.execute(text("""
                SELECT id FROM agents WHERE id = :agent_id AND is_active = true
            """), {"agent_id": agent_id})
            
            if not agent_check.fetchone():
                raise HTTPException(status_code=404, detail="Agent not found")
            
            # Update settings
            for key, value in settings.items():
                connection.execute(text("""
                    INSERT INTO agent_settings (agent_id, setting_key, setting_value)
                    VALUES (:agent_id, :setting_key, :setting_value)
                    ON CONFLICT (agent_id, setting_key) 
                    DO UPDATE SET setting_value = :setting_value, updated_at = CURRENT_TIMESTAMP
                """), {
                    "agent_id": agent_id,
                    "setting_key": key,
                    "setting_value": json.dumps(value)
                })
            
            connection.commit()
            
            return {"message": f"Settings updated for agent {agent_id}", "updated_settings": list(settings.keys())}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update settings: {str(e)}")

# File upload endpoint (existing functionality)
@app.post("/upload-file/{agent_id}")
async def upload_file(agent_id: str, file: UploadFile = File(...)):
    """Upload a file for a specific agent"""
    try:
        # Create agent directory
        agent_dir = get_agent_data_directory(agent_id)
        
        # Save file
        file_path = agent_dir / file.filename
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Record in database if agent exists
        try:
            with engine.connect() as connection:
                # Get agent by name
                agent_result = connection.execute(text("""
                    SELECT id FROM agents WHERE name = :agent_name
                """), {"agent_name": agent_id})
                
                agent_row = agent_result.fetchone()
                if agent_row:
                    # Record file in database
                    connection.execute(text("""
                        INSERT INTO agent_files (agent_id, filename, original_filename, file_path, file_size, file_type, mime_type)
                        VALUES (:agent_id, :filename, :original_filename, :file_path, :file_size, :file_type, :mime_type)
                    """), {
                        "agent_id": agent_row.id,
                        "filename": file.filename,
                        "original_filename": file.filename,
                        "file_path": str(file_path),
                        "file_size": len(content),
                        "file_type": file.filename.split('.')[-1] if '.' in file.filename else "unknown",
                        "mime_type": file.content_type
                    })
                    connection.commit()
        except Exception as db_error:
            print(f"Warning: Could not record file in database: {db_error}")
        
        return {
            "message": f"File uploaded successfully for agent {agent_id}",
            "filename": file.filename,
            "size": len(content),
            "path": str(file_path)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

# Query endpoint (existing functionality)
@app.post("/query/")
async def query_documents(request: Request):
    """Query documents for a specific agent"""
    try:
        data = await request.json()
        agent_id = data.get("agent_id", "None")
        query = data.get("query", "")
        
        print(f"📝 Query received for agent {agent_id}: '{query[:50]}...'")
        
        # Get agent files
        files = get_agent_files(agent_id)
        print(f"📁 Found {len(files)} files for agent {agent_id}: {files}")
        
        # Mock response for now (you can implement actual RAG later)
        response = {
            "agent_id": agent_id,
            "query": query,
            "response": f"This is a mock response for agent {agent_id}. Found {len(files)} files to search through.",
            "sources": files[:3],  # Return first 3 files as sources
            "rag_used": len(files) > 0
        }
        
        print(f"✅ Response sent: {len(response['response'])} chars")
        return response
        
    except Exception as e:
        print(f"❌ Query error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    
    print("🚀 Starting Enhanced RAG Backend with Database...")
    print("🌐 Server: http://localhost:8000")
    print("📚 API Docs: http://localhost:8000/docs") 
    print("💚 Health Check: http://localhost:8000/health")
    print("🗄️  Database:", DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else "not-configured")
    print("🤖 RAG Available:", RAG_AVAILABLE)
    print("🛑 Press Ctrl+C to stop")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
