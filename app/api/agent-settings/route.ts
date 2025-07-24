// API route for agent settings management
import pool from '../db';
import { NextRequest, NextResponse } from 'next/server';

// GET settings for an agent by id or name
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url!);
    const id = searchParams.get('id');
    const name = searchParams.get('name');
    let agentId = id;
    if (!agentId && name) {
      const agentRes = await pool.query('SELECT id FROM agents WHERE name = $1', [name]);
      if (agentRes.rows.length === 0) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
      }
      agentId = agentRes.rows[0].id;
    }
    if (!agentId) {
      return NextResponse.json({ error: 'Agent id or name required' }, { status: 400 });
    }
    const result = await pool.query(
      'SELECT setting_key, setting_value FROM agent_settings WHERE agent_id = $1',
      [agentId]
    );
    return NextResponse.json({ settings: result.rows }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// PUT update or create a setting for an agent
export async function PUT(req: NextRequest) {
  try {
    const { agent_id, agent_name, key, value } = await req.json();
    let agentId = agent_id;
    if (!agentId && agent_name) {
      const agentRes = await pool.query('SELECT id FROM agents WHERE name = $1', [agent_name]);
      if (agentRes.rows.length === 0) {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
      }
      agentId = agentRes.rows[0].id;
    }
    if (!agentId || !key) {
      return NextResponse.json({ error: 'agent_id (or agent_name) and key are required' }, { status: 400 });
    }
    await pool.query(
      `INSERT INTO agent_settings (agent_id, setting_key, setting_value)
       VALUES ($1, $2, $3)
       ON CONFLICT (agent_id, setting_key)
       DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = CURRENT_TIMESTAMP`,
      [agentId, key, JSON.stringify(value)]
    );
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
