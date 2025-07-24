#!/usr/bin/env python3
"""
One-Step RAG Backend Solution
This script will stop the problematic backend and start the working one
"""

import subprocess
import sys
import time
import os

def kill_python_processes():
    """Kill all Python processes"""
    try:
        subprocess.run(['taskkill', '/F', '/IM', 'python.exe'], 
                      capture_output=True, check=False)
        print("🛑 Stopped Python processes")
        time.sleep(2)
    except Exception as e:
        print(f"⚠️  Could not stop processes: {e}")

def check_port():
    """Check if port 8000 is free"""
    try:
        result = subprocess.run(['netstat', '-an'], 
                              capture_output=True, text=True)
        if ':8000' in result.stdout:
            print("⚠️  Port 8000 still in use")
            return False
        else:
            print("✅ Port 8000 is free")
            return True
    except Exception:
        return True

def start_working_backend():
    """Start the working backend"""
    if not os.path.exists('working_rag_backend.py'):
        print("❌ working_rag_backend.py not found!")
        print("🔧 Please run: python working_rag_backend.py")
        return False
    
    print("🚀 Starting working RAG backend...")
    print("📍 Server will be at: http://localhost:8000")
    print("💚 Health check: http://localhost:8000/health")
    print("🛑 Press Ctrl+C to stop")
    print()
    
    try:
        # Start the working backend
        subprocess.run([sys.executable, 'working_rag_backend.py'])
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting backend: {e}")

def main():
    print("🔧 RAG Backend Fix & Start")
    print("=" * 30)
    
    # Step 1: Kill existing processes
    kill_python_processes()
    
    # Step 2: Check port
    check_port()
    
    # Step 3: Start working backend
    start_working_backend()

if __name__ == "__main__":
    main()
