#!/usr/bin/env python3
"""
RAG Backend Restart Script
Stops current backend and starts test version
"""

import subprocess
import time
import requests
import sys

def kill_port_process(port=8000):
    """Kill any process using the specified port"""
    try:
        # Find process using port
        result = subprocess.run([
            'netstat', '-ano', '|', 'findstr', f':{port}'
        ], shell=True, capture_output=True, text=True)
        
        if result.stdout:
            print(f"🔍 Process found using port {port}")
            lines = result.stdout.strip().split('\n')
            for line in lines:
                if 'LISTENING' in line:
                    parts = line.split()
                    if len(parts) > 4:
                        pid = parts[-1]
                        print(f"🛑 Killing process {pid}")
                        subprocess.run(['taskkill', '/F', '/PID', pid], 
                                     capture_output=True)
        else:
            print(f"✅ No process found using port {port}")
            
    except Exception as e:
        print(f"⚠️  Error checking port: {str(e)}")

def test_backend_connection(timeout=5):
    """Test if backend is responsive"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=timeout)
        if response.status_code == 200:
            print("✅ Backend is responsive")
            return True
        else:
            print(f"⚠️  Backend returned status: {response.status_code}")
            return False
    except requests.exceptions.RequestException:
        print("❌ Backend is not responsive")
        return False

def main():
    print("🔄 RAG Backend Restart Script")
    print("=" * 40)
    
    # Step 1: Check current status
    print("1. Checking current backend status...")
    if test_backend_connection():
        print("   Backend is currently running")
    else:
        print("   Backend is not responsive")
    
    # Step 2: Kill current process
    print("2. Stopping current backend...")
    kill_port_process(8000)
    time.sleep(2)
    
    # Step 3: Verify port is free
    print("3. Verifying port is free...")
    if not test_backend_connection(timeout=2):
        print("   ✅ Port 8000 is now free")
    else:
        print("   ⚠️  Port still in use")
    
    print("\n🚀 Now start the test backend manually:")
    print("   python test_rag_backend.py")
    print("\n🔧 Or start the full backend:")
    print("   python rag_backend_agent_specific.py")
    print("\n💡 Then test with:")
    print("   http://localhost:8000/health")

if __name__ == "__main__":
    main()
