// Test both database query and API endpoint
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'agentic_ai',
  password: 'qKiaZpWa5FUR&H',
  port: 5432,
});

async function compareDatabaseAndAPI() {
  try {
    console.log('=== TESTING DATABASE DIRECT QUERY ===');
    const dbResult = await pool.query('SELECT * FROM agents ORDER BY id DESC');
    console.log('Database query result:');
    console.log('Rows count:', dbResult.rows.length);
    console.log('Rows:', JSON.stringify(dbResult.rows, null, 2));
    
    console.log('\n=== TESTING API ENDPOINT ===');
    
    // Test the API endpoint
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('http://localhost:3000/api/agents');
    
    console.log('API Response status:', response.status);
    console.log('API Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const apiData = await response.json();
      console.log('API Response data:', JSON.stringify(apiData, null, 2));
      
      if (apiData.agents) {
        console.log('API agents count:', apiData.agents.length);
        
        // Compare database vs API
        if (dbResult.rows.length === apiData.agents.length) {
          console.log('✅ Database and API have same number of agents');
        } else {
          console.log('❌ Mismatch: DB has', dbResult.rows.length, 'agents, API has', apiData.agents?.length || 0);
        }
      } else {
        console.log('❌ API response missing agents array');
      }
    } else {
      const errorText = await response.text();
      console.log('❌ API Error response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

compareDatabaseAndAPI();
