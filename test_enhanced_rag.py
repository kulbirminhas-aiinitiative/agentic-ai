#!/usr/bin/env python3
"""
Test script for Enhanced Working RAG Backend
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_endpoint(endpoint, method="GET", data=None):
    """Test an endpoint and print results"""
    print(f"\n{'='*60}")
    print(f"Testing {method} {endpoint}")
    print('='*60)
    
    try:
        if method == "GET":
            response = requests.get(f"{BASE_URL}{endpoint}")
        elif method == "POST":
            response = requests.post(f"{BASE_URL}{endpoint}", json=data)
        else:
            print(f"Unsupported method: {method}")
            return
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("Response:")
            print(json.dumps(result, indent=2))
        else:
            print(f"Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed. Is the server running?")
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    print("🧪 Testing Enhanced Working RAG Backend")
    print(f"Server: {BASE_URL}")
    
    # Test basic endpoints
    test_endpoint("/")
    test_endpoint("/health")
    test_endpoint("/system-status")
    
    # Test agent files
    test_endpoint("/agent-files/6")
    test_endpoint("/agent-files/8")
    
    # Test query functionality
    test_query_data = {
        "query": "What documents do you have access to?",
        "agent_id": "6",
        "model": "gpt-4o"
    }
    test_endpoint("/query/", "POST", test_query_data)
    
    # Test with agent that has no files
    test_query_data_empty = {
        "query": "Tell me about the documents",
        "agent_id": "8",
        "model": "gpt-4o"
    }
    test_endpoint("/query/", "POST", test_query_data_empty)
    
    # Test file processing
    test_process_data = {
        "agent_id": "6"
    }
    test_endpoint("/process-agent-file/", "POST", test_process_data)
    
    print(f"\n{'='*60}")
    print("✅ Test complete!")
    print("📋 Check the results above to verify functionality")
    print("🔧 If RAG is not initialized, check your API keys in .env")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
