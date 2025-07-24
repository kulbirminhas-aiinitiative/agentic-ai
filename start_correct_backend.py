#!/usr/bin/env python3
"""
RAG Backend Startup Manager
Ensures the correct backend is started with proper configuration
"""

import subprocess
import os
import sys
import time

def check_files():
    """Check which RAG backend files are available"""
    backends = {
        'agent_specific': 'rag_backend_agent_specific.py',
        'test': 'test_rag_backend.py', 
        'old': 'rag_backend.py',
        'simplified': 'rag_backend_simplified.py'
    }
    
    available = {}
    for name, filename in backends.items():
        if os.path.exists(filename):
            available[name] = filename
            
    return available

def kill_existing_processes():
    """Kill any existing Python processes that might be running backends"""
    try:
        # Kill processes using port 8000
        result = subprocess.run([
            'powershell', '-Command', 
            "Get-Process | Where-Object { $_.ProcessName -eq 'python' } | Stop-Process -Force"
        ], capture_output=True, text=True)
        
        time.sleep(2)  # Wait for processes to terminate
        print("🛑 Stopped existing Python processes")
        
    except Exception as e:
        print(f"⚠️  Could not stop processes: {e}")

def start_backend(backend_file):
    """Start the specified backend"""
    print(f"🚀 Starting {backend_file}...")
    
    try:
        # Start in background
        process = subprocess.Popen([
            sys.executable, backend_file
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Give it time to start
        time.sleep(3)
        
        # Check if it's still running
        if process.poll() is None:
            print(f"✅ {backend_file} started successfully")
            print("🌐 Server should be available at: http://localhost:8000")
            print("💚 Health check: http://localhost:8000/health")
            return True
        else:
            stdout, stderr = process.communicate()
            print(f"❌ {backend_file} failed to start")
            print(f"STDOUT: {stdout.decode()}")
            print(f"STDERR: {stderr.decode()}")
            return False
            
    except Exception as e:
        print(f"❌ Error starting {backend_file}: {e}")
        return False

def main():
    print("🔧 RAG Backend Startup Manager")
    print("=" * 40)
    
    # Check available backends
    available = check_files()
    print("Available backends:")
    for name, filename in available.items():
        print(f"  - {name}: {filename}")
    
    if not available:
        print("❌ No RAG backend files found!")
        return
    
    # Stop existing processes
    kill_existing_processes()
    
    # Decide which backend to start
    if 'test' in available:
        backend_to_start = available['test']
        print(f"\n🧪 Starting test backend: {backend_to_start}")
    elif 'agent_specific' in available:
        backend_to_start = available['agent_specific']
        print(f"\n🎯 Starting agent-specific backend: {backend_to_start}")
    else:
        backend_to_start = list(available.values())[0]
        print(f"\n🔄 Starting available backend: {backend_to_start}")
    
    # Start the backend
    success = start_backend(backend_to_start)
    
    if success:
        print("\n✅ Backend startup completed!")
        print("\n🔧 Next steps:")
        print("1. Test health: http://localhost:8000/health")
        print("2. Test chat: http://localhost:3000/chat/6")
        print("3. Check browser console for any errors")
    else:
        print("\n❌ Backend startup failed!")
        print("\n🔧 Try manually:")
        print(f"   python {backend_to_start}")

if __name__ == "__main__":
    main()
