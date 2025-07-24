// API route for agent settings management
import pool from '../db';
import { NextRequest, NextResponse } from 'next/server';

// GET settings for an agent by id or name
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url!);
    const id = searchParams.get('id');
    const name = searchParams.get('name');
    
    console.log('Agent Settings API: GET request', { id, name });
    
    let agentId = id;
    if (!agentId && name) {
      console.log('Agent Settings API: Looking up agent by name:', name);
      const agentRes = await pool.query('SELECT id FROM agents WHERE name = $1', [name]);
      console.log('Agent Settings API: Agent lookup result', {
        found: agentRes.rows.length > 0,
        agentId: agentRes.rows[0]?.id
      });
      
      if (agentRes.rows.length === 0) {
        console.error('Agent Settings API: Agent not found by name:', name);
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
      }
      agentId = agentRes.rows[0].id;
    }
    
    if (!agentId) {
      console.error('Agent Settings API: No agent ID or name provided');
      return NextResponse.json({ error: 'Agent id or name required' }, { status: 400 });
    }
    
    console.log('Agent Settings API: Fetching settings for agent ID:', agentId);
    const result = await pool.query(
      'SELECT setting_key, setting_value FROM agent_settings WHERE agent_id = $1',
      [agentId]
    );
    
    console.log('Agent Settings API: Settings query result', {
      agentId,
      settingsCount: result.rows.length,
      settings: result.rows
    });
    
    return NextResponse.json({ settings: result.rows }, { status: 200 });
  } catch (err) {
    console.error('Agent Settings API: Error', {
      error: err,
      errorMessage: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    });
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// POST bulk update settings for an agent
export async function POST(req: NextRequest) {
  try {
    const { settings } = await req.json();
    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json({ error: 'Settings array is required' }, { status: 400 });
    }

    // Begin transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const setting of settings) {
        const { agent_id, setting_key, setting_value } = setting;
        if (!agent_id || !setting_key) {
          throw new Error('agent_id and setting_key are required for each setting');
        }
        
        await client.query(
          `INSERT INTO agent_settings (agent_id, setting_key, setting_value)
           VALUES ($1, $2, $3)
           ON CONFLICT (agent_id, setting_key)
           DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_at = CURRENT_TIMESTAMP`,
          [agent_id, setting_key, setting_value]
        );
      }
      
      await client.query('COMMIT');
      return NextResponse.json({ success: true, message: 'Settings saved successfully' }, { status: 200 });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
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
