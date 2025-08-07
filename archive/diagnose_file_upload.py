#!/usr/bin/env python3
"""
Diagnostic script to check file upload issue
"""

import os
import requests
from pathlib import Path

def check_file_system():
    """Check files in the file system"""
    print("🔍 Checking File System:")
    print("=" * 40)
    
    agents_dir = Path("data/agents")
    if agents_dir.exists():
        for agent_dir in agents_dir.iterdir():
            if agent_dir.is_dir():
                files = [f.name for f in agent_dir.iterdir() if f.is_file()]
                print(f"Agent {agent_dir.name}: {len(files)} files")
                for file in files:
                    print(f"  - {file}")
    else:
        print("❌ No agents directory found")

def check_frontend_api():
    """Check frontend API"""
    print("\n🔍 Checking Frontend API:")
    print("=" * 40)
    
    try:
        # Test agent 6
        response = requests.get('http://localhost:3000/api/agent-files?agent_id=6', timeout=5)
        print(f"Agent 6 - Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Database files: {len(data.get('files', []))}")
            for file in data.get('files', []):
                print(f"  - {file.get('original_filename', 'unknown')} ({file.get('filename', 'unknown')})")
        else:
            print(f"Error: {response.text[:200]}")
            
        # Test agent 8  
        response = requests.get('http://localhost:3000/api/agent-files?agent_id=8', timeout=5)
        print(f"Agent 8 - Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Database files: {len(data.get('files', []))}")
        else:
            print(f"Error: {response.text[:200]}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Frontend server not running (http://localhost:3000)")
    except Exception as e:
        print(f"❌ Frontend API error: {e}")

def check_backend_api():
    """Check enhanced backend API"""
    print("\n🔍 Checking Enhanced Backend API:")
    print("=" * 40)
    
    try:
        # Test agent 6
        response = requests.get('http://localhost:8000/agent-files/6', timeout=5)
        print(f"Agent 6 - Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"File system files: {len(data.get('files', []))}")
            for file in data.get('files', []):
                print(f"  - {file}")
        else:
            print(f"Error: {response.text[:200]}")
            
        # Test agent 8
        response = requests.get('http://localhost:8000/agent-files/8', timeout=5)
        print(f"Agent 8 - Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"File system files: {len(data.get('files', []))}")
        else:
            print(f"Error: {response.text[:200]}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Enhanced backend not running (http://localhost:8000)")
    except Exception as e:
        print(f"❌ Enhanced backend error: {e}")

def main():
    print("🔧 File Upload Diagnostic Tool")
    print("=" * 50)
    
    check_file_system()
    check_frontend_api()
    check_backend_api()
    
    print("\n📋 Summary:")
    print("=" * 50)
    print("If files exist in file system but not in database:")
    print("  → Files were uploaded directly to file system")
    print("  → Frontend won't show them (needs database entries)")
    print("\nIf files exist in database but not in file system:")
    print("  → Database entries exist but files are missing")
    print("  → This indicates a storage issue")
    print("\nFor proper operation:")
    print("  → Files should exist in BOTH database AND file system")
    print("  → Use the AgentFileManager for uploads")

if __name__ == "__main__":
    main()
