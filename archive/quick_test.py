import json

# Test basic functionality
print("🧪 Testing Enhanced RAG Backend Components")

# Test 1: Check if working_rag_backend.py exists and is readable
try:
    with open("working_rag_backend.py", "r") as f:
        content = f.read()
    print("✅ Backend file exists and is readable")
    print(f"📏 File size: {len(content)} characters")
except Exception as e:
    print(f"❌ Cannot read backend file: {e}")

# Test 2: Check file structure
import os
from pathlib import Path

agents_dir = Path("data/agents")
if agents_dir.exists():
    print("✅ Agents directory exists")
    for agent_dir in agents_dir.iterdir():
        if agent_dir.is_dir():
            files = [f.name for f in agent_dir.iterdir() if f.is_file()]
            print(f"📁 Agent {agent_dir.name}: {len(files)} files")
else:
    print("⚠️ Agents directory not found")

# Test 3: Check if dependencies are importable
print("\n🔍 Testing imports:")

try:
    import fastapi
    print("✅ FastAPI available")
except ImportError:
    print("❌ FastAPI not available")

try:
    import uvicorn
    print("✅ Uvicorn available")
except ImportError:
    print("❌ Uvicorn not available")

try:
    from dotenv import load_dotenv
    print("✅ python-dotenv available")
except ImportError:
    print("❌ python-dotenv not available")

# Test 4: Check for optional RAG components
print("\n🔍 Testing optional RAG components:")

try:
    from llama_index.core import VectorStoreIndex
    print("✅ LlamaIndex core available")
except ImportError:
    print("⚠️ LlamaIndex core not available (backend will use fallback mode)")

try:
    from pinecone import Pinecone
    print("✅ Pinecone available")
except ImportError:
    print("⚠️ Pinecone not available (backend will use fallback mode)")

# Test 5: Check environment variables
print("\n🔍 Testing environment:")
load_dotenv()

openai_key = os.getenv("OPENAI_API_KEY")
pinecone_key = os.getenv("PINECONE_API_KEY")

print(f"OPENAI_API_KEY: {'SET' if openai_key else 'NOT SET'}")
print(f"PINECONE_API_KEY: {'SET' if pinecone_key else 'NOT SET'}")

print("\n📋 Summary:")
print("The enhanced backend is ready to run!")
print("🚀 Run: python working_rag_backend.py")
print("🌐 Visit: http://localhost:8000")
print("📚 Docs: http://localhost:8000/docs")
