#!/usr/bin/env python3
"""
RAG Backend Diagnostic Script
Tests RAG backend connectivity and configuration
"""

import os
import sys
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

def check_environment():
    """Check if all required environment variables are set"""
    print("🔍 Checking Environment Variables...")
    
    required_vars = {
        'PINECONE_API_KEY': os.getenv('PINECONE_API_KEY'),
        'PINECONE_ENVIRONMENT': os.getenv('PINECONE_ENVIRONMENT'),
        'PINECONE_INDEX_NAME': os.getenv('PINECONE_INDEX_NAME'),
        'OPENAI_API_KEY': os.getenv('OPENAI_API_KEY')
    }
    
    missing_vars = []
    for var_name, var_value in required_vars.items():
        if var_value:
            print(f"   ✅ {var_name}: {'*' * min(8, len(var_value))}...")
        else:
            print(f"   ❌ {var_name}: Not set")
            missing_vars.append(var_name)
    
    if missing_vars:
        print(f"\n❌ Missing required environment variables: {', '.join(missing_vars)}")
        return False
    
    print("✅ All environment variables are set")
    return True

def test_pinecone_connection():
    """Test Pinecone connectivity"""
    print("\n🔍 Testing Pinecone Connection...")
    
    try:
        from pinecone import Pinecone
        
        pc = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))
        indexes = pc.list_indexes()
        print(f"   ✅ Connected to Pinecone successfully")
        print(f"   📊 Available indexes: {[idx.name for idx in indexes.indexes]}")
        
        index_name = os.getenv('PINECONE_INDEX_NAME', 'llamaindex-demo')
        if index_name in [idx.name for idx in indexes.indexes]:
            print(f"   ✅ Target index '{index_name}' exists")
        else:
            print(f"   ⚠️  Target index '{index_name}' does not exist - will be created")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Pinecone connection failed: {str(e)}")
        return False

def test_openai_connection():
    """Test OpenAI API connectivity"""
    print("\n🔍 Testing OpenAI Connection...")
    
    try:
        import openai
        
        # Set API key
        openai.api_key = os.getenv('OPENAI_API_KEY')
        
        # Simple test request
        response = openai.models.list()
        print(f"   ✅ Connected to OpenAI successfully")
        print(f"   🤖 Available models count: {len(response.data)}")
        
        return True
        
    except Exception as e:
        print(f"   ❌ OpenAI connection failed: {str(e)}")
        return False

def check_file_structure():
    """Check agent file structure"""
    print("\n🔍 Checking Agent File Structure...")
    
    data_dir = "data"
    agents_dir = os.path.join(data_dir, "agents")
    
    if not os.path.exists(data_dir):
        print(f"   ❌ Data directory '{data_dir}' does not exist")
        return False
    
    if not os.path.exists(agents_dir):
        print(f"   ❌ Agents directory '{agents_dir}' does not exist")
        return False
    
    print(f"   ✅ Data structure exists")
    
    # Check agent directories
    agent_dirs = [d for d in os.listdir(agents_dir) if os.path.isdir(os.path.join(agents_dir, d))]
    print(f"   📁 Agent directories: {agent_dirs}")
    
    for agent_id in agent_dirs:
        agent_path = os.path.join(agents_dir, agent_id)
        files = os.listdir(agent_path)
        print(f"      Agent {agent_id}: {len(files)} files - {files}")
    
    return True

def test_rag_backend():
    """Test if RAG backend is running and responsive"""
    print("\n🔍 Testing RAG Backend Server...")
    
    try:
        # Test health endpoint
        response = requests.get("http://localhost:8000/docs", timeout=5)
        if response.status_code == 200:
            print("   ✅ RAG backend is running on port 8000")
        else:
            print(f"   ❌ RAG backend returned status: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("   ❌ RAG backend is not running on port 8000")
        print("   💡 Start it with: python rag_backend_agent_specific.py")
        return False
    except Exception as e:
        print(f"   ❌ Error testing RAG backend: {str(e)}")
        return False
    
    # Test query endpoint
    try:
        test_data = {
            "query": "test query",
            "agent_id": "6"
        }
        
        response = requests.post("http://localhost:8000/query/", json=test_data, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ Query endpoint working - Source: {result.get('source', 'unknown')}")
            return True
        else:
            print(f"   ❌ Query endpoint returned status: {response.status_code}")
            print(f"   📝 Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error testing query endpoint: {str(e)}")
        return False

def main():
    print("🚀 RAG Backend Diagnostic Tool")
    print("=" * 50)
    
    # Run all checks
    checks = [
        ("Environment Variables", check_environment),
        ("File Structure", check_file_structure),
        ("Pinecone Connection", test_pinecone_connection),
        ("OpenAI Connection", test_openai_connection),
        ("RAG Backend Server", test_rag_backend),
    ]
    
    results = {}
    for check_name, check_func in checks:
        try:
            results[check_name] = check_func()
        except Exception as e:
            print(f"   ❌ {check_name} failed with exception: {str(e)}")
            results[check_name] = False
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 DIAGNOSTIC SUMMARY")
    print("=" * 50)
    
    all_passed = True
    for check_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status:<8} {check_name}")
        if not passed:
            all_passed = False
    
    if all_passed:
        print("\n🎉 All checks passed! RAG backend should be working correctly.")
    else:
        print("\n⚠️  Some checks failed. Please fix the issues above.")
        print("\n🔧 Common fixes:")
        print("   1. Set missing environment variables in .env.local")
        print("   2. Install missing Python packages: pip install -r requirements.txt")
        print("   3. Start RAG backend: python rag_backend_agent_specific.py")
        print("   4. Check firewall/port 8000 availability")

if __name__ == "__main__":
    main()
