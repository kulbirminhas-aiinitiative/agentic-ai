"""
Minimal RAG Backend Test - Isolate Import Issues
"""

import os
from dotenv import load_dotenv

load_dotenv()

print("Step 1: Basic imports...")
try:
    from fastapi import FastAPI
    print("✅ FastAPI imported")
except Exception as e:
    print(f"❌ FastAPI import failed: {e}")
    exit(1)

print("Step 2: Pinecone import...")
try:
    from pinecone import Pinecone
    print("✅ Pinecone imported")
except Exception as e:
    print(f"❌ Pinecone import failed: {e}")

print("Step 3: LlamaIndex core import...")
try:
    from llama_index.core import VectorStoreIndex
    print("✅ LlamaIndex core imported")
except Exception as e:
    print(f"❌ LlamaIndex core import failed: {e}")
    print("🔧 Try: pip install llama-index")

print("Step 4: LlamaIndex Pinecone import...")
try:
    from llama_index.vector_stores.pinecone import PineconeVectorStore
    print("✅ LlamaIndex Pinecone imported")
except Exception as e:
    print(f"❌ LlamaIndex Pinecone import failed: {e}")
    print("🔧 Try: pip install llama-index-vector-stores-pinecone")

print("Step 5: Testing environment variables...")
openai_key = os.getenv('OPENAI_API_KEY')
if openai_key and openai_key != 'your-openai-api-key-here':
    print(f"✅ OpenAI API Key: {openai_key[:10]}...")
else:
    print("❌ OpenAI API Key not properly set")

print("Step 6: Testing OpenAI import...")
try:
    import openai
    print("✅ OpenAI imported")
except Exception as e:
    print(f"❌ OpenAI import failed: {e}")
    print("🔧 Try: pip install openai")

print("\n🎯 All import tests completed")
