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
export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM agents ORDER BY id DESC');
    return NextResponse.json({ agents: result.rows }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
// API route to create a new agent in the Postgres database
import pool from '../db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { name, display_name, description } = await req.json();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    const result = await pool.query(
      'INSERT INTO agents (name, display_name, description) VALUES ($1, $2, $3) RETURNING *',
      [name, display_name || null, description || null]
    );
    return NextResponse.json({ agent: result.rows[0] }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
