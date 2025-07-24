const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'agentic_ai',
  password: 'qKiaZpWa5FUR&H',
  port: 5432,
});

async function testAgentCreation() {
  console.log('🧪 Testing agent creation with rag_architecture...');
  
  try {
    const client = await pool.connect();
    
    // Test creating a new agent with rag_architecture
    const testAgent = {
      name: 'test-rag-agent',
      display_name: 'Test RAG Agent',
      description: 'A test agent to verify rag_architecture column works',
      rag_architecture: 'llamaindex-pinecone'
    };
    
    console.log('📝 Creating test agent:', testAgent);
    
    const result = await client.query(
      'INSERT INTO agents (name, display_name, description, rag_architecture) VALUES ($1, $2, $3, $4) RETURNING *',
      [testAgent.name, testAgent.display_name, testAgent.description, testAgent.rag_architecture]
    );
    
    console.log('✅ Agent created successfully:', result.rows[0]);
    
    // Verify the agent exists with correct data
    const verifyResult = await client.query(
      'SELECT id, name, display_name, description, rag_architecture FROM agents WHERE name = $1',
      [testAgent.name]
    );
    
    console.log('🔍 Verification query result:', verifyResult.rows[0]);
    
    // Clean up - delete the test agent
    await client.query('DELETE FROM agents WHERE name = $1', [testAgent.name]);
    console.log('🧹 Test agent cleaned up');
    
    client.release();
    console.log('✅ Agent creation test completed successfully!');
    
  } catch (error) {
    console.error('❌ Agent creation test failed:', error);
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
  testAgentCreation();
}

module.exports = { testAgentCreation };
