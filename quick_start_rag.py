#!/usr/bin/env python3
"""
RAG Backend Quick Start and Test Script
Handles the SimpleDirectoryReader error and provides diagnostics
"""

import os
import sys
import json
from pathlib import Path

def check_file_structure():
    """Check and report on the current file structure"""
    print("🔍 Checking File Structure...")
    
    # Check data directory
    data_dir = Path("data")
    if not data_dir.exists():
        print(f"❌ Data directory '{data_dir}' does not exist")
        return False
    
    # Check for files in root data directory
    data_files = [f for f in data_dir.iterdir() if f.is_file()]
    print(f"📁 Files in data/: {len(data_files)} files")
    for file in data_files:
        print(f"   - {file.name}")
    
    # Check agent directories
    agents_dir = data_dir / "agents"
    if not agents_dir.exists():
        print(f"❌ Agents directory '{agents_dir}' does not exist")
        return False
    
    agent_dirs = [d for d in agents_dir.iterdir() if d.is_dir()]
    print(f"📁 Agent directories: {len(agent_dirs)}")
    
    for agent_dir in agent_dirs:
        agent_files = [f for f in agent_dir.iterdir() if f.is_file()]
        print(f"   Agent {agent_dir.name}: {len(agent_files)} files")
        for file in agent_files:
            print(f"      - {file.name}")
    
    return True

def test_rag_backend_imports():
    """Test individual imports to identify issues"""
    print("\n🔧 Testing RAG Backend Imports...")
    
    imports_to_test = [
        ("FastAPI", "from fastapi import FastAPI"),
        ("Uvicorn", "import uvicorn"),
        ("dotenv", "from dotenv import load_dotenv"),
        ("os", "import os"),
        ("pathlib", "from pathlib import Path"),
    ]
    
    failed_imports = []
    
    for name, import_stmt in imports_to_test:
        try:
            exec(import_stmt)
            print(f"   ✅ {name}")
        except Exception as e:
            print(f"   ❌ {name}: {str(e)}")
            failed_imports.append(name)
    
    if failed_imports:
        print(f"\n❌ Failed imports: {', '.join(failed_imports)}")
        print("🔧 Install missing packages with:")
        print("   pip install fastapi uvicorn python-dotenv")
        return False
    
    return True

def create_test_rag_backend():
    """Create a minimal test RAG backend"""
    test_backend_code = '''
import os
from fastapi import FastAPI, HTTPException
from pathlib import Path
import json

app = FastAPI(title="RAG Backend Test")

@app.get("/")
async def root():
    return {"status": "running", "message": "Test RAG Backend"}

@app.get("/health")
async def health():
    """Health check with file structure info"""
    
    # Check data structure
    data_dir = Path("data")
    agents_dir = data_dir / "agents"
    
    structure = {
        "data_exists": data_dir.exists(),
        "agents_exists": agents_dir.exists(),
        "agents": {}
    }
    
    if agents_dir.exists():
        for agent_dir in agents_dir.iterdir():
            if agent_dir.is_dir():
                files = [f.name for f in agent_dir.iterdir() if f.is_file()]
                structure["agents"][agent_dir.name] = {
                    "file_count": len(files),
                    "files": files
                }
    
    return {
        "status": "healthy",
        "file_structure": structure,
        "environment": {
            "OPENAI_API_KEY": "SET" if os.getenv("OPENAI_API_KEY") else "NOT SET",
            "PINECONE_API_KEY": "SET" if os.getenv("PINECONE_API_KEY") else "NOT SET"
        }
    }

@app.post("/query/")
async def test_query(request_data: dict):
    """Test query endpoint"""
    agent_id = request_data.get("agent_id", "unknown")
    query = request_data.get("query", "")
    
    # Check if agent has files
    agent_dir = Path("data") / "agents" / str(agent_id)
    files = []
    if agent_dir.exists():
        files = [f.name for f in agent_dir.iterdir() if f.is_file()]
    
    return {
        "response": f"[TEST MODE] Agent {agent_id} query received: '{query}'. Found {len(files)} files.",
        "agent_id": agent_id,
        "files_found": files,
        "status": "test_mode"
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Test RAG Backend on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
'''
    
    with open("test_rag_backend.py", "w") as f:
        f.write(test_backend_code)
    
    print("📝 Created test_rag_backend.py")
    return True

def main():
    print("🚀 RAG Backend Quick Start")
    print("=" * 50)
    
    # Step 1: Check file structure
    if not check_file_structure():
        print("\n❌ File structure issues found")
        return
    
    # Step 2: Test imports
    if not test_rag_backend_imports():
        print("\n❌ Import issues found")
        return
    
    # Step 3: Create test backend
    create_test_rag_backend()
    
    print("\n✅ Setup completed!")
    print("\n🚀 Next steps:")
    print("1. Start test backend: python test_rag_backend.py")
    print("2. Test health: http://localhost:8000/health")
    print("3. Test with your chat app")
    print("\n💡 If test backend works, then try the full backend:")
    print("   python rag_backend_agent_specific.py")

if __name__ == "__main__":
    main()
