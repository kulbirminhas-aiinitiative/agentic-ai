import { NextRequest, NextResponse } from "next/server";
import pool from '../db';
import fs from "fs/promises";
import path from "path";

// GET files for a specific agent
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agent_id");
    
    if (!agentId) {
      return NextResponse.json({ error: "agent_id is required" }, { status: 400 });
    }

    const result = await pool.query(
      `SELECT af.*, a.name as agent_name, a.display_name 
       FROM agent_files af 
       JOIN agents a ON af.agent_id = a.id 
       WHERE af.agent_id = $1 
       ORDER BY af.created_at DESC`,
      [agentId]
    );

    return NextResponse.json({ files: result.rows });
  } catch (err) {
    console.error('Error fetching agent files:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// POST - Upload file for specific agent with auto-agent creation
export async function POST(req: NextRequest) {
  try {
    console.log("POST endpoint hit");
    
    const formData = await req.formData();
    console.log("FormData parsed successfully");
    
    const file = formData.get("file") as File;
    const agentId = formData.get("agent_id") as string;
    
    console.log(`📤 Upload request: Agent ${agentId}, File: ${file?.name}`);
    
    if (!file) {
      console.log("No file in request");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    
    if (!agentId) {
      console.log("No agent_id in request");  
      return NextResponse.json({ error: "agent_id is required" }, { status: 400 });
    }

    console.log("File and agent_id validated");

    // Create agent-specific directory first (skip database for now)
    const agentUploadDir = path.join(process.cwd(), "data", "agents", agentId);
    await fs.mkdir(agentUploadDir, { recursive: true });
    console.log("Directory created: " + agentUploadDir);

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = path.extname(file.name);
    const baseFilename = path.basename(file.name, fileExtension);
    const uniqueFilename = `${baseFilename}_${timestamp}${fileExtension}`;
    const filePath = path.join(agentUploadDir, uniqueFilename);
    
    // Write file to directory
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);
    
    console.log(`💾 File saved to: ${filePath}`);

    // Return success (skip database and RAG processing for now)
    return NextResponse.json({
      message: "File uploaded successfully (basic mode)",
      path: filePath,
      size: file.size,
      filename: uniqueFilename
    });
    
  } catch (error: any) {
    console.error("❌ Upload error:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json({
      error: "Upload failed: " + error.message
    }, { status: 500 });
  }
}

// DELETE - Remove file for specific agent
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("file_id");
    const agentId = searchParams.get("agent_id");
    
    if (!fileId || !agentId) {
      return NextResponse.json({ error: "file_id and agent_id are required" }, { status: 400 });
    }

    const fileResult = await pool.query(
      'SELECT * FROM agent_files WHERE id = $1 AND agent_id = $2',
      [fileId, agentId]
    );

    if (fileResult.rows.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileRecord = fileResult.rows[0];

    try {
      await fs.unlink(fileRecord.file_path);
    } catch (err) {
      console.error('Error deleting physical file:', err);
    }

    await pool.query('DELETE FROM agent_files WHERE id = $1', [fileId]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting agent file:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
