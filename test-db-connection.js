// Simple database connection test
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'agentic_ai',
  password: 'qKiaZpWa5FUR&H',
  port: 5432,
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Check if agents table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'agents'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ Agents table exists');
      
      // Check agents in table
      const agents = await client.query('SELECT * FROM agents ORDER BY id DESC');
      console.log(`📊 Found ${agents.rows.length} agents in database:`);
      
      if (agents.rows.length > 0) {
        agents.rows.forEach((agent, index) => {
          console.log(`  ${index + 1}. ID: ${agent.id}, Name: ${agent.name}, Description: ${agent.description || 'N/A'}`);
        });
      } else {
        console.log('  ⚠️  No agents found in database');
        
        // Create a sample agent for testing
        console.log('Creating a test agent...');
        const result = await client.query(
          'INSERT INTO agents (name, display_name, description, rag_architecture) VALUES ($1, $2, $3, $4) RETURNING *',
          ['Test Agent', 'Test Agent Display', 'A test agent for testing purposes', 'baseline']
        );
        console.log('✅ Test agent created:', result.rows[0]);
      }
    } else {
      console.log('❌ Agents table does not exist');
      
      // Create the agents table
      console.log('Creating agents table...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS agents (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          display_name VARCHAR(255),
          description TEXT,
          rag_architecture VARCHAR(100) DEFAULT 'baseline',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Agents table created');
      
      // Create a sample agent
      const result = await client.query(
        'INSERT INTO agents (name, display_name, description, rag_architecture) VALUES ($1, $2, $3, $4) RETURNING *',
        ['Sample Agent', 'Sample Agent Display', 'A sample agent for testing', 'baseline']
      );
      console.log('✅ Sample agent created:', result.rows[0]);
    }
    
    // Check if agent_settings table exists
    const settingsTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'agent_settings'
      );
    `);
    
    if (settingsTableCheck.rows[0].exists) {
      console.log('✅ Agent_settings table exists');
    } else {
      console.log('❌ Agent_settings table does not exist');
      console.log('Creating agent_settings table...');
      await client.query(`
        CREATE TABLE IF NOT EXISTS agent_settings (
          id SERIAL PRIMARY KEY,
          agent_id INTEGER REFERENCES agents(id) ON DELETE CASCADE,
          setting_key VARCHAR(255) NOT NULL,
          setting_value TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(agent_id, setting_key)
        );
      `);
      console.log('✅ Agent_settings table created');
    }
    
    client.release();
    console.log('🎉 Database test completed successfully');
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

testConnection();
