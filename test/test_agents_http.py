#!/usr/bin/env python3
"""
HTTP Test for Agents API
Test the actual HTTP endpoint and capture detailed error information
"""

import requests
import json
import traceback
import time

def test_agents_http_endpoint():
    """Test the /agents HTTP endpoint with detailed error handling"""
    print("🌐 Testing /agents HTTP endpoint...")
    
    base_url = "http://localhost:8000"
    endpoint = "/agents"
    full_url = f"{base_url}{endpoint}"
    
    try:
        print(f"📡 Making request to: {full_url}")
        
        # Test with requests library (similar to our test framework)
        response = requests.get(full_url, timeout=10)
        
        print(f"📊 Response status: {response.status_code}")
        print(f"📊 Response headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"✅ SUCCESS: Got {len(data)} agents")
                for i, agent in enumerate(data[:3]):  # Show first 3
                    print(f"   Agent {i+1}: {agent.get('name', 'Unknown')} ({agent.get('file_count', 0)} files)")
                if len(data) > 3:
                    print(f"   ... and {len(data) - 3} more agents")
                return True
            except json.JSONDecodeError as e:
                print(f"❌ Invalid JSON response: {e}")
                print(f"📄 Raw response: {response.text[:500]}...")
        else:
            print(f"❌ HTTP Error {response.status_code}")
            print(f"📄 Error response: {response.text}")
            
            # Try to get more details from server logs
            if response.status_code == 500:
                print("\n🔍 Investigating 500 error...")
                
                # Check if it's a JSON error response
                try:
                    error_data = response.json()
                    print(f"📋 Error details: {error_data}")
                except:
                    print(f"📋 Raw error text: {response.text}")
        
        return False
        
    except requests.exceptions.ConnectionError as e:
        print(f"❌ Connection Error: {e}")
        print("🔧 Check if backend server is running on port 8000")
        return False
    except requests.exceptions.Timeout as e:
        print(f"❌ Timeout Error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")
        traceback.print_exc()
        return False

def test_other_endpoints():
    """Test other working endpoints for comparison"""
    print("\n🔍 Testing other endpoints for comparison...")
    
    endpoints = ["/health", "/system-status"]
    
    for endpoint in endpoints:
        try:
            url = f"http://localhost:8000{endpoint}"
            response = requests.get(url, timeout=5)
            print(f"📡 {endpoint}: {response.status_code} - {response.text[:100]}...")
        except Exception as e:
            print(f"📡 {endpoint}: ERROR - {e}")

if __name__ == "__main__":
    print("🔧 HTTP Test for Agents API")
    print("=" * 40)
    
    # Test the agents endpoint
    success = test_agents_http_endpoint()
    
    # Test other endpoints
    test_other_endpoints()
    
    print(f"\n{'🎉 SUCCESS' if success else '💥 FAILED'}: Agents HTTP endpoint test")
