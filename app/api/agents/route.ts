// API route to create and manage agents in the Postgres database
import pool from '../db';
import { NextRequest, NextResponse } from 'next/server';

// DELETE: Remove an agent by id
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Agent id is required' }, { status: 400 });
    }
    const result = await pool.query('DELETE FROM agents WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, deleted: result.rows[0] }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// GET: Fetch all agents
export async function GET() {
  try {
    console.log('Agents API: GET request received');
    const result = await pool.query('SELECT * FROM agents ORDER BY created_at DESC');
    console.log('Agents API: Query result', {
      agentCount: result.rows.length,
      agents: result.rows.map(agent => ({ id: agent.id, name: agent.name, rag_architecture: agent.rag_architecture }))
    });
    return NextResponse.json({ agents: result.rows }, { status: 200 });
  } catch (err) {
    console.error('Agents API: Error', {
      error: err,
      errorMessage: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    });
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// POST: Create a new agent
export async function POST(req: NextRequest) {
  try {
    const { name, display_name, description, rag_architecture } = await req.json();
    console.log('Agents API: POST request', { name, display_name, description, rag_architecture });
    
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    
    const result = await pool.query(
      'INSERT INTO agents (name, display_name, description, rag_architecture) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, display_name || null, description || null, rag_architecture || 'llamaindex-pinecone']
    );
    
    console.log('Agents API: Agent created', result.rows[0]);
    return NextResponse.json({ agent: result.rows[0] }, { status: 201 });
  } catch (err) {
    console.error('Agents API: POST error', {
      error: err,
      errorMessage: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    });
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
