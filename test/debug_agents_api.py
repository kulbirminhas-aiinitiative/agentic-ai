#!/usr/bin/env python3
"""
Debug Agents API Endpoint
Test the /agents endpoint directly and catch the specific error
"""

import os
import sys
import traceback
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

def test_agents_function_directly():
    """Test the get_agent_files and agents logic directly without HTTP"""
    print("🔍 Testing agents endpoint logic directly...")
    
    try:
        # Import the functions from rag_backend
        from rag_backend import get_agent_files, get_agent_data_directory
        
        print("\n✅ Successfully imported functions from rag_backend")
        
        # Test the agents directory
        agents_dir = Path("data/agents")
        print(f"\n📁 Checking agents directory: {agents_dir}")
        print(f"   - Exists: {agents_dir.exists()}")
        print(f"   - Is directory: {agents_dir.is_dir() if agents_dir.exists() else 'N/A'}")
        
        if agents_dir.exists():
            subdirs = [d for d in agents_dir.iterdir() if d.is_dir()]
            print(f"   - Subdirectories: {[d.name for d in subdirs]}")
            
            # Test get_agent_files for each subdirectory
            for agent_dir in subdirs:
                print(f"\n🔍 Testing agent: {agent_dir.name}")
                try:
                    files = get_agent_files(agent_dir.name)
                    print(f"   - Files found: {files}")
                except Exception as e:
                    print(f"   - ❌ Error getting files: {e}")
                    traceback.print_exc()
        else:
            print("   - Directory doesn't exist, will use default agents")
        
        # Now simulate the full agents endpoint logic
        print(f"\n🚀 Simulating full agents endpoint logic...")
        
        agents = []
        
        if agents_dir.exists():
            agent_id = 1
            for agent_dir in agents_dir.iterdir():
                if agent_dir.is_dir():
                    print(f"   - Processing agent directory: {agent_dir.name}")
                    files = get_agent_files(agent_dir.name)
                    agent_data = {
                        "id": agent_id,
                        "name": agent_dir.name,
                        "display_name": agent_dir.name.replace("_", " ").title(),
                        "description": f"AI Agent with {len(files)} uploaded documents",
                        "rag_architecture": "llamaindex-pinecone",
                        "created_at": "2024-01-01T00:00:00.000Z",
                        "updated_at": "2024-01-01T00:00:00.000Z",
                        "is_active": True,
                        "file_count": len(files),
                        "files": files
                    }
                    agents.append(agent_data)
                    print(f"     ✅ Created agent data: {agent_data['name']}")
                    agent_id += 1
        
        # Default agents fallback
        if not agents:
            print("   - No agents found, using default agent")
            agents = [{
                "id": 1,
                "name": "default_agent",
                "display_name": "Default Agent",
                "description": "Default AI Agent for general queries",
                "rag_architecture": "llamaindex-pinecone",
                "created_at": "2024-01-01T00:00:00.000Z",
                "updated_at": "2024-01-01T00:00:00.000Z",
                "is_active": True,
                "file_count": 0,
                "files": []
            }]
        
        print(f"\n✅ SUCCESS: Generated {len(agents)} agents")
        for i, agent in enumerate(agents):
            print(f"   Agent {i+1}: {agent['name']} ({agent['file_count']} files)")
        
        return agents
        
    except Exception as e:
        print(f"\n❌ ERROR in agents logic: {e}")
        traceback.print_exc()
        return None

if __name__ == "__main__":
    print("🔧 Debugging Agents API Endpoint Error")
    print("=" * 50)
    
    # Change to project root directory
    os.chdir(project_root)
    print(f"📁 Working directory: {Path.cwd()}")
    
    # Test the function
    result = test_agents_function_directly()
    
    if result:
        print(f"\n🎉 SUCCESS: Agents function works correctly!")
        print(f"📊 Found {len(result)} agents")
    else:
        print(f"\n💥 FAILED: Agents function has errors")
        print(f"🔧 Check the error details above to fix the backend")
