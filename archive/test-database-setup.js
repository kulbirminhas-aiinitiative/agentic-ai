const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'agentic_ai',
  password: process.env.POSTGRES_PASSWORD || 'qKiaZpWa5FUR&H',
  port: process.env.POSTGRES_PORT || 5432,
});

async function testDatabaseAndApplyMigrations() {
  console.log('🔍 Testing database connection and applying migrations...');
  
  try {
    // Test connection
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Check if rag_architecture column exists
    const ragColCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'agents' AND column_name = 'rag_architecture'
    `);
    
    if (ragColCheck.rows.length === 0) {
      console.log('📝 Adding rag_architecture column to agents table...');
      await client.query(`
        ALTER TABLE agents ADD COLUMN rag_architecture VARCHAR(50) DEFAULT 'llamaindex-pinecone'
      `);
      await client.query(`
        UPDATE agents SET rag_architecture = 'llamaindex-pinecone' WHERE rag_architecture IS NULL
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_agents_rag_arch ON agents(rag_architecture)
      `);
      console.log('✅ RAG architecture column added successfully');
    } else {
      console.log('✅ RAG architecture column already exists');
    }
    
    // Check if agent_files table exists
    const filesTableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'agent_files'
    `);
    
    if (filesTableCheck.rows.length === 0) {
      console.log('📝 Creating agent_files table...');
      await client.query(`
        CREATE TABLE agent_files (
          id SERIAL PRIMARY KEY,
          agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
          filename VARCHAR(255) NOT NULL,
          original_filename VARCHAR(255) NOT NULL,
          file_path VARCHAR(512) NOT NULL,
          file_size BIGINT NOT NULL,
          file_type VARCHAR(100),
          mime_type VARCHAR(100),
          upload_status VARCHAR(50) DEFAULT 'uploaded',
          processing_status VARCHAR(50) DEFAULT 'pending',
          processed_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await client.query(`
        CREATE INDEX idx_agent_files_agent_id ON agent_files(agent_id)
      `);
      await client.query(`
        CREATE INDEX idx_agent_files_status ON agent_files(upload_status)
      `);
      await client.query(`
        CREATE INDEX idx_agent_files_processing ON agent_files(processing_status)
      `);
      await client.query(`
        CREATE INDEX idx_agent_files_filename ON agent_files(filename)
      `);
      
      console.log('✅ agent_files table created successfully');
    } else {
      console.log('✅ agent_files table already exists');
    }
    
    // Check current agents
    const agentsResult = await client.query('SELECT id, name, display_name, rag_architecture FROM agents ORDER BY id');
    console.log('📊 Current agents:');
    agentsResult.rows.forEach(agent => {
      console.log(`   - ID: ${agent.id}, Name: ${agent.name}, Display: ${agent.display_name || 'N/A'}, RAG: ${agent.rag_architecture || 'N/A'}`);
    });
    
    // Check agent files
    const filesResult = await client.query(`
      SELECT af.id, af.agent_id, af.filename, af.processing_status, a.name as agent_name
      FROM agent_files af 
      JOIN agents a ON af.agent_id = a.id 
      ORDER BY af.created_at DESC 
      LIMIT 10
    `);
    console.log('📁 Recent agent files:');
    if (filesResult.rows.length === 0) {
      console.log('   - No files uploaded yet');
    } else {
      filesResult.rows.forEach(file => {
        console.log(`   - File: ${file.filename}, Agent: ${file.agent_name}, Status: ${file.processing_status}`);
      });
    }
    
    client.release();
    console.log('✅ Database test completed successfully');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    });
  } finally {
    await pool.end();
  }
}

// Run the test
if (require.main === module) {
  testDatabaseAndApplyMigrations();
}

module.exports = { testDatabaseAndApplyMigrations };
