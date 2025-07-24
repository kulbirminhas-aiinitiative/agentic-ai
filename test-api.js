// Test the /api/agents endpoint
async function testAgentsAPI() {
  try {
    console.log('Testing /api/agents endpoint...');
    
    const response = await fetch('http://localhost:3000/api/agents');
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('API Response:', JSON.stringify(data, null, 2));
      
      if (data.agents && Array.isArray(data.agents)) {
        console.log(`✅ Found ${data.agents.length} agents in API response`);
        data.agents.forEach((agent, index) => {
          console.log(`  ${index + 1}. ID: ${agent.id}, Name: ${agent.name}, Description: ${agent.description || 'N/A'}`);
        });
      } else {
        console.log('❌ No agents array in response');
      }
    } else {
      const errorText = await response.text();
      console.log('❌ API Error:', errorText);
    }
  } catch (error) {
    console.error('❌ Fetch error:', error.message);
  }
}

testAgentsAPI();
