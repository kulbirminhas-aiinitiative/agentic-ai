#!/usr/bin/env python3
"""
Debug agent file upload issue for agents 8 and 9
"""

import requests
import json
from pathlib import Path

def test_agent_existence():
    """Test if agents 8 and 9 exist in the database"""
    print("🔍 Testing Agent Existence:")
    print("=" * 40)
    
    try:
        response = requests.get('http://localhost:3000/api/agents', timeout=10)
        if response.status_code == 200:
            data = response.json()
            agents = data.get('agents', [])
            
            print(f"Total agents found: {len(agents)}")
            for agent in agents:
                agent_id = agent.get('id')
                name = agent.get('name', 'unknown')
                display_name = agent.get('display_name', 'none')
                print(f"  - Agent {agent_id}: {name} ({display_name})")
            
            # Check if agents 8 and 9 exist
            agent_ids = [agent.get('id') for agent in agents]
            for check_id in [6, 8, 9]:
                exists = check_id in agent_ids
                print(f"  → Agent {check_id}: {'✅ EXISTS' if exists else '❌ MISSING'}")
                
            return agents
        else:
            print(f"❌ API Error: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        return []

def test_file_uploads():
    """Test file upload process for different agents"""
    print("\n🔍 Testing File Upload Process:")
    print("=" * 40)
    
    for agent_id in [6, 8, 9]:
        print(f"\nTesting Agent {agent_id}:")
        
        # Test database-based file list
        try:
            response = requests.get(f'http://localhost:3000/api/agent-files?agent_id={agent_id}', timeout=5)
            if response.status_code == 200:
                data = response.json()
                files = data.get('files', [])
                print(f"  Database files: {len(files)}")
                for file in files[:3]:  # Show first 3
                    print(f"    - {file.get('original_filename', 'unknown')}")
            else:
                print(f"  Database error: {response.status_code}")
        except Exception as e:
            print(f"  Database error: {e}")
        
        # Test bridge endpoint
        try:
            response = requests.get(f'http://localhost:3000/api/agent-files-bridge?agent_id={agent_id}', timeout=5)
            if response.status_code == 200:
                data = response.json()
                files = data.get('files', [])
                source = data.get('source', 'unknown')
                print(f"  Bridge files: {len(files)} (source: {source})")
            else:
                print(f"  Bridge error: {response.status_code}")
        except Exception as e:
            print(f"  Bridge error: {e}")
        
        # Test enhanced backend
        try:
            response = requests.get(f'http://localhost:8000/agent-files/{agent_id}', timeout=5)
            if response.status_code == 200:
                data = response.json()
                files = data.get('files', [])
                print(f"  Backend files: {len(files)}")
            else:
                print(f"  Backend error: {response.status_code}")
        except Exception as e:
            print(f"  Backend error: {e}")

def check_file_system():
    """Check actual files in file system"""
    print("\n🔍 File System Check:")
    print("=" * 40)
    
    agents_dir = Path("data/agents")
    if agents_dir.exists():
        for agent_dir in agents_dir.iterdir():
            if agent_dir.is_dir():
                files = list(agent_dir.glob('*'))
                file_names = [f.name for f in files if f.is_file()]
                print(f"Agent {agent_dir.name}: {len(file_names)} files")
                for file_name in file_names[:3]:  # Show first 3
                    print(f"  - {file_name}")
    else:
        print("❌ No agents directory found")

def test_upload_simulation():
    """Simulate what happens during upload"""
    print("\n🔍 Upload Process Analysis:")
    print("=" * 40)
    
    # Check if the /api/agent-files endpoint exists and works
    for agent_id in [8, 9]:
        print(f"\nAgent {agent_id} upload test:")
        
        # Test if we can POST to the endpoint (without actual file)
        try:
            # Don't actually upload, just test the endpoint
            response = requests.get(f'http://localhost:3000/api/agent-files?agent_id={agent_id}')
            print(f"  Agent-files endpoint: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"  Current files in DB: {len(data.get('files', []))}")
            elif response.status_code == 500:
                print("  ⚠️ Database error - might be missing agent_files table or agent doesn't exist")
            else:
                print(f"  Unexpected status: {response.text[:100]}")
                
        except Exception as e:
            print(f"  Connection error: {e}")

def main():
    print("🔧 Debug: Agent File Upload Issue")
    print("=" * 50)
    
    agents = test_agent_existence()
    test_file_uploads()
    check_file_system()
    test_upload_simulation()
    
    print("\n📋 Diagnosis:")
    print("=" * 50)
    
    agent_ids = [agent.get('id') for agent in agents]
    
    if 8 not in agent_ids:
        print("❌ Agent 8 doesn't exist in database - uploads will fail")
    if 9 not in agent_ids:
        print("❌ Agent 9 doesn't exist in database - uploads will fail")
    
    print("\n💡 Possible Issues:")
    print("1. Agents 8/9 don't exist in database")
    print("2. agent_files table doesn't exist")
    print("3. Upload succeeds but files aren't persisted")
    print("4. Bridge endpoint not finding files after upload")
    
    print("\n🚀 Solutions:")
    print("1. Create missing agents in database")
    print("2. Run database migration for agent_files table")
    print("3. Check upload endpoint error handling")

if __name__ == "__main__":
    main()
