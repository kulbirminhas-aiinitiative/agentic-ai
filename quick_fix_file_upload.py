#!/usr/bin/env python3
"""
Quick Fix: Update the enhanced RAG backend to provide file data 
compatible with the frontend AgentFileManager
"""

import requests
import json

def test_backend_connectivity():
    """Test if the enhanced backend is running"""
    try:
        response = requests.get('http://localhost:8000/health', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Enhanced backend is running")
            print(f"   RAG initialized: {data.get('rag_system', {}).get('initialized', False)}")
            return True
        else:
            print(f"⚠️ Backend responded with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Enhanced backend not running on http://localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Backend test error: {e}")
        return False

def test_frontend_connectivity():
    """Test if the frontend is running"""
    try:
        response = requests.get('http://localhost:3000/api/agents', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Frontend is running")
            print(f"   Agents available: {len(data.get('agents', []))}")
            return True
        else:
            print(f"⚠️ Frontend responded with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Frontend not running on http://localhost:3000")
        return False
    except Exception as e:
        print(f"❌ Frontend test error: {e}")
        return False

def create_bridge_endpoint():
    """Create a bridge endpoint in the enhanced backend"""
    
    bridge_code = '''

# Add this to working_rag_backend.py after the existing endpoints

@app.get("/frontend-compatible-files/{agent_id}")
async def get_frontend_compatible_files(agent_id: str):
    """Get files in a format compatible with the frontend AgentFileManager"""
    try:
        files = get_agent_files(agent_id)
        
        # Convert to frontend-compatible format
        compatible_files = []
        for i, filename in enumerate(files):
            agent_dir = get_agent_data_directory(agent_id)
            file_path = agent_dir / filename
            
            if file_path.exists():
                stat = file_path.stat()
                compatible_files.append({
                    "id": i + 1,  # Fake ID for frontend compatibility
                    "agent_id": int(agent_id),
                    "filename": filename,
                    "original_filename": filename,
                    "file_path": str(file_path),
                    "file_size": stat.st_size,
                    "file_type": file_path.suffix.lower(),
                    "mime_type": "application/pdf" if file_path.suffix.lower() == ".pdf" else "text/plain",
                    "upload_status": "uploaded",
                    "processing_status": "processed",
                    "processed_at": stat.st_mtime,
                    "created_at": stat.st_ctime,
                    "updated_at": stat.st_mtime
                })
        
        return {
            "files": compatible_files,
            "source": "enhanced_backend",
            "agent_id": agent_id
        }
        
    except Exception as e:
        print(f"❌ Error in frontend-compatible endpoint: {e}")
        return {
            "files": [],
            "error": str(e),
            "agent_id": agent_id
        }
'''
    
    with open("bridge_endpoint_code.py", "w") as f:
        f.write(bridge_code)
    
    print("✅ Created bridge_endpoint_code.py")
    print("   Add this code to working_rag_backend.py to bridge the gap")

def create_frontend_patch():
    """Create a patch for the frontend to use the enhanced backend"""
    
    patch_code = '''
// Patch for AgentFileManager.tsx
// Replace the fetchFiles function with this version

const fetchFiles = async () => {
  if (!agentId) return;
  
  setLoading(true);
  try {
    // Try the database-based API first
    let response = await fetch(`/api/agent-files?agent_id=${agentId}`);
    let data = await response.json();
    
    if (response.ok && data.files && data.files.length > 0) {
      setFiles(data.files);
      console.log('Loaded files from database:', data.files.length);
    } else {
      // Fallback to enhanced backend
      console.log('No files in database, trying enhanced backend...');
      response = await fetch(`http://localhost:8000/frontend-compatible-files/${agentId}`);
      data = await response.json();
      
      if (response.ok && data.files) {
        setFiles(data.files);
        console.log('Loaded files from enhanced backend:', data.files.length);
      } else {
        console.error('No files found in either database or backend');
        setFiles([]);
      }
    }
  } catch (error) {
    console.error('Error fetching files:', error);
    setFiles([]);
  } finally {
    setLoading(false);
  }
};
'''
    
    with open("frontend_patch.js", "w") as f:
        f.write(patch_code)
    
    print("✅ Created frontend_patch.js")
    print("   Use this to patch AgentFileManager.tsx")

def main():
    print("🔧 Quick Fix for File Upload Issue")
    print("=" * 50)
    
    backend_ok = test_backend_connectivity()
    frontend_ok = test_frontend_connectivity()
    
    print("\n📋 Status:")
    print(f"Enhanced Backend: {'✅ Running' if backend_ok else '❌ Not Running'}")
    print(f"Frontend: {'✅ Running' if frontend_ok else '❌ Not Running'}")
    
    if backend_ok:
        create_bridge_endpoint()
    
    if frontend_ok:
        create_frontend_patch()
    
    print("\n🚀 Quick Solutions:")
    print("1. Temporary Fix: Add bridge endpoint to enhanced backend")
    print("2. Patch the frontend to use enhanced backend as fallback")
    print("3. Long-term: Run database migration and sync files")
    
    print("\n💡 The core issue:")
    print("   Files exist in file system but frontend needs database entries")
    print("   The bridge endpoint provides compatibility between both systems")

if __name__ == "__main__":
    main()
