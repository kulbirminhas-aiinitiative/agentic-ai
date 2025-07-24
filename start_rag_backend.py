#!/usr/bin/env python3
"""
RAG Backend Startup Script with Better Error Handling
"""

import os
import sys
from dotenv import load_dotenv

def check_prerequisites():
    """Check if all prerequisites are met before starting"""
    print("🔍 Checking RAG Backend Prerequisites...")
    
    # Load environment variables
    load_dotenv()
    
    # Check OpenAI API Key
    openai_key = os.getenv('OPENAI_API_KEY')
    if not openai_key or openai_key == 'your-openai-api-key-here':
        print("❌ OPENAI_API_KEY is not set or is placeholder value")
        print("🔧 Please set a valid OpenAI API key in .env.local:")
        print("   OPENAI_API_KEY=sk-your-actual-openai-key-here")
        return False
    
    # Check Pinecone API Key
    pinecone_key = os.getenv('PINECONE_API_KEY')
    if not pinecone_key:
        print("❌ PINECONE_API_KEY is not set")
        return False
    
    # Check required directories
    data_dir = "data/agents"
    if not os.path.exists(data_dir):
        print(f"📁 Creating directory: {data_dir}")
        os.makedirs(data_dir, exist_ok=True)
    
    print("✅ Prerequisites check passed")
    return True

def start_rag_backend():
    """Start the RAG backend with error handling"""
    if not check_prerequisites():
        print("\n❌ Cannot start RAG backend due to missing prerequisites")
        return False
    
    try:
        print("🚀 Starting RAG Backend...")
        
        # Import with error handling
        try:
            import uvicorn
        except ImportError:
            print("❌ uvicorn not installed. Install with: pip install uvicorn")
            return False
        
        # Import the app
        from rag_backend_agent_specific import app
        
        print("✅ RAG Backend loaded successfully")
        print("🌐 Starting server on http://localhost:8000")
        print("📚 API documentation: http://localhost:8000/docs")
        print("🛑 Press Ctrl+C to stop")
        
        # Start the server
        uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("🔧 Try installing missing packages:")
        print("   pip install fastapi uvicorn llama-index pinecone-client python-dotenv")
        return False
    except Exception as e:
        print(f"❌ Error starting RAG backend: {e}")
        return False

if __name__ == "__main__":
    start_rag_backend()
