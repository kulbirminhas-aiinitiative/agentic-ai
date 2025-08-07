#!/usr/bin/env python3
"""
Validation script for Enhanced Working RAG Backend
Tests imports and basic functionality
"""

import sys
import os

def test_basic_imports():
    """Test basic required imports"""
    print("🔍 Testing basic imports...")
    try:
        import fastapi
        import uvicorn
        from pathlib import Path
        from dotenv import load_dotenv
        print("✅ Basic imports successful")
        return True
    except ImportError as e:
        print(f"❌ Basic import failed: {e}")
        return False

def test_rag_imports():
    """Test RAG component imports"""
    print("🔍 Testing RAG imports...")
    try:
        from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
        from llama_index.vector_stores.pinecone import PineconeVectorStore
        from llama_index.llms.openai import OpenAI
        from llama_index.embeddings.openai import OpenAIEmbedding
        from pinecone import Pinecone, ServerlessSpec
        print("✅ RAG imports successful")
        return True
    except ImportError as e:
        print(f"⚠️ RAG imports failed: {e}")
        print("ℹ️ This is OK - backend will run in fallback mode")
        return False

def test_environment():
    """Test environment configuration"""
    print("🔍 Testing environment...")
    load_dotenv()
    
    openai_key = os.getenv("OPENAI_API_KEY")
    pinecone_key = os.getenv("PINECONE_API_KEY")
    
    print(f"OpenAI API Key: {'SET' if openai_key else 'NOT SET'}")
    print(f"Pinecone API Key: {'SET' if pinecone_key else 'NOT SET'}")
    
    return bool(openai_key and pinecone_key)

def test_file_structure():
    """Test file structure"""
    print("🔍 Testing file structure...")
    
    agents_dir = Path("data/agents")
    if agents_dir.exists():
        for agent_dir in agents_dir.iterdir():
            if agent_dir.is_dir():
                files = [f.name for f in agent_dir.iterdir() if f.is_file()]
                print(f"Agent {agent_dir.name}: {len(files)} files - {files}")
    else:
        print("⚠️ No agents directory found")
    
    return True

def test_backend_import():
    """Test importing the backend itself"""
    print("🔍 Testing backend import...")
    try:
        # Add current directory to path
        sys.path.insert(0, os.getcwd())
        
        # Import the backend module
        import working_rag_backend
        print("✅ Backend import successful")
        
        # Test some key components
        print(f"RAG Available: {working_rag_backend.RAG_AVAILABLE}")
        print(f"Model Name: {working_rag_backend.MODEL_NAME}")
        
        return True
    except Exception as e:
        print(f"❌ Backend import failed: {e}")
        return False

def main():
    print("🧪 Enhanced RAG Backend Validation")
    print("=" * 50)
    
    results = {
        "basic_imports": test_basic_imports(),
        "rag_imports": test_rag_imports(),
        "environment": test_environment(),
        "file_structure": test_file_structure(),
        "backend_import": test_backend_import()
    }
    
    print("\n" + "=" * 50)
    print("📊 Validation Results:")
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")
    
    print("\n📋 Summary:")
    if results["basic_imports"] and results["backend_import"]:
        print("✅ Backend can start in fallback mode")
        if results["rag_imports"] and results["environment"]:
            print("✅ Backend can start with full RAG functionality")
        else:
            print("⚠️ RAG functionality limited (missing dependencies or API keys)")
    else:
        print("❌ Backend cannot start - check dependencies")
    
    print("\n🚀 To start the backend, run:")
    print("python working_rag_backend.py")
    print("\n🧪 To test the backend, run:")
    print("python test_enhanced_rag.py")

if __name__ == "__main__":
    main()
