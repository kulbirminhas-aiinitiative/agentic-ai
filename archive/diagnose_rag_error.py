#!/usr/bin/env python3
"""
RAG Backend Error Diagnosis Script
Tests the RAG backend endpoint to identify the 500 error cause
"""

import requests
import json
import traceback
from urllib.parse import urljoin

def test_rag_backend():
    """Test RAG backend endpoints step by step"""
    base_url = "http://localhost:8000"
    
    print("🔍 Testing RAG Backend Endpoints...")
    
    # Test 1: Basic health check
    print("\n1. Testing root endpoint...")
    try:
        response = requests.get(f"{base_url}/", timeout=5)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text[:200]}...")
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        return False
    
    # Test 2: Health endpoint (if exists)
    print("\n2. Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   Response: {json.dumps(response.json(), indent=2)}")
        else:
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
    
    # Test 3: Agent files endpoint
    print("\n3. Testing agent files endpoint...")
    try:
        response = requests.get(f"{base_url}/agent-files/6", timeout=5)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Files for agent 6: {data.get('count', 0)} files")
            print(f"   Files: {data.get('files', [])}")
        else:
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
    
    # Test 4: Query endpoint (the problematic one)
    print("\n4. Testing query endpoint...")
    try:
        test_payload = {
            "query": "test query",
            "agent_id": "6"
        }
        
        print(f"   Sending payload: {json.dumps(test_payload, indent=2)}")
        response = requests.post(f"{base_url}/query/", json=test_payload, timeout=10)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"   ✅ Success! Response: {data.get('response', '')[:100]}...")
                print(f"   Source: {data.get('source', 'unknown')}")
                return True
            except json.JSONDecodeError:
                print(f"   ⚠️  Non-JSON response: {response.text}")
        else:
            print(f"   ❌ Error response: {response.text}")
            
    except requests.exceptions.Timeout:
        print("   ❌ Request timed out (10 seconds)")
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        print(f"   Traceback: {traceback.format_exc()}")
    
    return False

def test_environment_setup():
    """Test if environment is properly configured"""
    print("\n🔧 Testing Environment Setup...")
    
    import os
    from dotenv import load_dotenv
    
    load_dotenv()
    
    env_vars = {
        "OPENAI_API_KEY": os.getenv("OPENAI_API_KEY"),
        "PINECONE_API_KEY": os.getenv("PINECONE_API_KEY"),
        "PINECONE_INDEX_NAME": os.getenv("PINECONE_INDEX_NAME")
    }
    
    for var, value in env_vars.items():
        if value and value != "your-openai-api-key-here":
            print(f"   ✅ {var}: {'*' * 8}...")
        else:
            print(f"   ❌ {var}: Not set or placeholder")
    
    # Check file structure
    print("\n📁 Checking File Structure...")
    data_path = "data/agents/6"
    if os.path.exists(data_path):
        files = [f for f in os.listdir(data_path) if os.path.isfile(os.path.join(data_path, f))]
        print(f"   Agent 6 files: {len(files)} - {files}")
    else:
        print(f"   ❌ Agent 6 directory not found: {data_path}")

def main():
    print("🚀 RAG Backend Error Diagnosis")
    print("=" * 50)
    
    # Test environment
    test_environment_setup()
    
    # Test backend
    success = test_rag_backend()
    
    print("\n" + "=" * 50)
    if success:
        print("✅ RAG Backend is working correctly!")
    else:
        print("❌ RAG Backend has issues. Common fixes:")
        print("1. Check if OpenAI API key is valid")
        print("2. Check if Pinecone API key is valid")
        print("3. Restart RAG backend: python rag_backend_agent_specific.py")
        print("4. Check server logs for detailed error messages")

if __name__ == "__main__":
    main()
