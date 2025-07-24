#!/usr/bin/env python3
"""
Fix File Upload Issue - Create missing agent_files table and sync data
"""

import os
import json
from pathlib import Path

def create_agent_files_migration():
    """Create the missing agent_files table migration script"""
    
    migration_sql = """
-- Fix: Create agent_files table for agent-specific file management
-- This enables the "Upload Files for Agent" section to work properly

-- First, ensure the update function exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create agent_files table
CREATE TABLE IF NOT EXISTS agent_files (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100),
    mime_type VARCHAR(100),
    upload_status VARCHAR(50) DEFAULT 'uploaded',
    processing_status VARCHAR(50) DEFAULT 'processed',
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agent_files_agent_id ON agent_files(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_files_status ON agent_files(upload_status);
CREATE INDEX IF NOT EXISTS idx_agent_files_processing ON agent_files(processing_status);
CREATE INDEX IF NOT EXISTS idx_agent_files_filename ON agent_files(filename);

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS update_agent_files_updated_at ON agent_files;
CREATE TRIGGER update_agent_files_updated_at BEFORE UPDATE ON agent_files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sync existing files from file system to database
-- This will populate the database with files that already exist in data/agents/
"""
    
    # Write migration file
    with open("fix_agent_files_migration.sql", "w") as f:
        f.write(migration_sql)
    
    print("✅ Created fix_agent_files_migration.sql")
    return "fix_agent_files_migration.sql"

def create_sync_script():
    """Create a script to sync existing files to database"""
    
    sync_script = """
#!/usr/bin/env python3
# Sync existing files from file system to database

import os
import psycopg2
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Database connection
try:
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        database=os.getenv('DB_NAME', 'agentic_ai'),
        user=os.getenv('DB_USER', 'postgres'),
        password=os.getenv('DB_PASSWORD', 'password'),
        port=os.getenv('DB_PORT', '5432')
    )
    cursor = conn.cursor()
    
    print("🔌 Connected to database")
    
    # Check if agent_files table exists
    cursor.execute('''
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'agent_files'
        );
    ''')
    
    if not cursor.fetchone()[0]:
        print("❌ agent_files table doesn't exist. Run the migration first!")
        exit(1)
    
    # Sync files from file system
    agents_dir = Path("data/agents")
    if agents_dir.exists():
        for agent_dir in agents_dir.iterdir():
            if agent_dir.is_dir() and agent_dir.name.isdigit():
                agent_id = int(agent_dir.name)
                
                # Check if agent exists in database
                cursor.execute('SELECT id FROM agents WHERE id = %s', (agent_id,))
                if not cursor.fetchone():
                    print(f"⚠️ Agent {agent_id} not found in database, skipping...")
                    continue
                
                # Get files in directory
                files = [f for f in agent_dir.iterdir() if f.is_file()]
                print(f"📁 Agent {agent_id}: Found {len(files)} files")
                
                for file_path in files:
                    # Check if file already exists in database
                    cursor.execute(
                        'SELECT id FROM agent_files WHERE agent_id = %s AND filename = %s',
                        (agent_id, file_path.name)
                    )
                    
                    if cursor.fetchone():
                        print(f"  - {file_path.name} (already in database)")
                        continue
                    
                    # Insert file record
                    try:
                        stat = file_path.stat()
                        cursor.execute('''
                            INSERT INTO agent_files 
                            (agent_id, filename, original_filename, file_path, file_size, file_type, mime_type, processing_status)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                        ''', (
                            agent_id,
                            file_path.name,
                            file_path.name,  # Assume original filename is the same
                            str(file_path.absolute()),
                            stat.st_size,
                            file_path.suffix.lower(),
                            'application/pdf' if file_path.suffix.lower() == '.pdf' else 'text/plain',
                            'processed'
                        ))
                        print(f"  + {file_path.name} (added to database)")
                    except Exception as e:
                        print(f"  ❌ {file_path.name} (error: {e})")
    
    conn.commit()
    print("✅ File sync completed!")
    
except Exception as e:
    print(f"❌ Database error: {e}")
    print("💡 Make sure your database is running and connection details are correct in .env")
finally:
    if 'conn' in locals():
        conn.close()
"""
    
    with open("sync_files_to_database.py", "w") as f:
        f.write(sync_script)
    
    print("✅ Created sync_files_to_database.py")
    return "sync_files_to_database.py"

def create_manual_instructions():
    """Create manual instructions for fixing the issue"""
    
    instructions = """
# Fix for "Upload Files for Agent" Section Not Showing Files

## Problem
The frontend "Upload Files for Agent" section is empty because:
1. The `agent_files` database table might not exist
2. Files exist in the file system but not in the database
3. There's a mismatch between database and file system

## Solution

### Step 1: Run Database Migration
```bash
# If you have psql installed:
psql -d agentic_ai -f fix_agent_files_migration.sql

# Or manually run the SQL in your database management tool
```

### Step 2: Sync Existing Files
```bash
# Make sure your .env file has correct database credentials
python sync_files_to_database.py
```

### Step 3: Test the Fix
1. Start your Next.js frontend: `npm run dev`
2. Start the enhanced RAG backend: `python working_rag_backend.py`
3. Go to the "Upload Files for Agent" section
4. Select an agent - you should now see uploaded files

## Alternative: Use AgentFileManager Component
If the above doesn't work, ensure you're using the correct component:
- The `AgentFileManager` component should be used for file uploads
- It handles both database and file system storage
- Files uploaded through this component will appear in both places

## Database Connection Issues?
If you can't connect to the database:
1. Check your .env file has the correct DB credentials
2. Make sure PostgreSQL is running
3. Verify the database and user exist
4. Test connection with: `psql -d agentic_ai -U your_username`

## Still Not Working?
1. Check the browser console for JavaScript errors
2. Check the Next.js server logs
3. Verify the API endpoint `/api/agent-files` is working
4. Test with: `curl "http://localhost:3000/api/agent-files?agent_id=6"`
"""
    
    with open("FIX_FILE_UPLOAD_INSTRUCTIONS.md", "w") as f:
        f.write(instructions)
    
    print("✅ Created FIX_FILE_UPLOAD_INSTRUCTIONS.md")
    return "FIX_FILE_UPLOAD_INSTRUCTIONS.md"

def main():
    print("🔧 Fixing File Upload Issue")
    print("=" * 50)
    
    # Create necessary files
    migration_file = create_agent_files_migration()
    sync_file = create_sync_script()
    instructions_file = create_manual_instructions()
    
    print("\n📋 Files Created:")
    print(f"1. {migration_file} - SQL migration to create agent_files table")
    print(f"2. {sync_file} - Python script to sync existing files to database")
    print(f"3. {instructions_file} - Manual instructions")
    
    print("\n🚀 Quick Fix (if you have database access):")
    print("1. Run the SQL migration in your database")
    print("2. Run: python sync_files_to_database.py")
    print("3. Restart your frontend and backend")
    print("4. Check the Upload Files for Agent section")
    
    print("\n💡 The issue is that files exist in the file system but not in the database.")
    print("   The frontend requires database entries to display files.")

if __name__ == "__main__":
    main()
