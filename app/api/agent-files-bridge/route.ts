import { NextRequest, NextResponse } from "next/server";

// Enhanced bridge API endpoint with better error handling and debugging
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agent_id");
    
    console.log(`🔍 Bridge API: Fetching files for agent ${agentId}`);
    
    if (!agentId) {
      return NextResponse.json({ error: "agent_id is required" }, { status: 400 });
    }

    let dbFiles = [];
    let dbError = null;

    // First try the database-based approach with detailed error handling
    try {
      const dbResponse = await fetch(`http://localhost:3000/api/agent-files?agent_id=${agentId}`);
      console.log(`📊 Database API status: ${dbResponse.status}`);
      
      if (dbResponse.ok) {
        const dbData = await dbResponse.json();
        dbFiles = dbData.files || [];
        console.log(`📊 Database returned ${dbFiles.length} files for agent ${agentId}`);
        
        if (dbFiles.length > 0) {
          return NextResponse.json({
            files: dbFiles,
            source: "database",
            agent_id: agentId,
            message: `Found ${dbFiles.length} files in database`
          });
        }
      } else {
        const errorText = await dbResponse.text();
        dbError = `Database API returned ${dbResponse.status}: ${errorText}`;
        console.log(`❌ Database error: ${dbError}`);
      }
    } catch (error) {
      dbError = `Database connection failed: ${error}`;
      console.log(`❌ Database connection error: ${error}`);
    }

    // Fallback to enhanced backend with detailed logging
    let backendFiles = [];
    let backendError = null;
    
    try {
      console.log(`🔄 Trying enhanced backend for agent ${agentId}...`);
      const backendResponse = await fetch(`http://localhost:8000/frontend-compatible-files/${agentId}`);
      
      console.log(`🚀 Backend API status: ${backendResponse.status}`);
      
      if (backendResponse.ok) {
        const backendData = await backendResponse.json();
        backendFiles = backendData.files || [];
        console.log(`🚀 Backend returned ${backendFiles.length} files for agent ${agentId}`);
        
        return NextResponse.json({
          files: backendFiles,
          source: "enhanced_backend", 
          agent_id: agentId,
          message: `Found ${backendFiles.length} files in file system`,
          debug: {
            database_attempted: true,
            database_error: dbError,
            backend_success: true
          }
        });
      } else {
        const errorText = await backendResponse.text();
        backendError = `Backend API returned ${backendResponse.status}: ${errorText}`;
        console.log(`❌ Backend error: ${backendError}`);
      }
    } catch (error) {
      backendError = `Backend connection failed: ${error}`;
      console.log(`❌ Backend connection error: ${error}`);
    }

    // Both failed - return empty with debug info
    return NextResponse.json({ 
      files: [], 
      source: "none",
      agent_id: agentId,
      message: "No files found in either database or file system",
      debug: {
        database_error: dbError,
        backend_error: backendError,
        file_count: 0
      }
    });

  } catch (err) {
    console.error('Bridge API critical error:', err);
    return NextResponse.json({ 
      error: (err as Error).message,
      agent_id: req.nextUrl.searchParams.get("agent_id"),
      source: "error"
    }, { status: 500 });
  }
}
