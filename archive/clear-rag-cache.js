// Script to clear RAG cache and trigger reindexing for agent-specific isolation

const https = require('https');
const http = require('http');

function fetchData(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const protocol = urlObj.protocol === 'https:' ? https : http;
        
        const reqOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        };
        
        const req = protocol.request(reqOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, json: () => jsonData });
                } catch (e) {
                    resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, text: () => data });
                }
            });
        });
        
        req.on('error', reject);
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

async function clearRagCache() {
    console.log('🔄 Clearing RAG backend cache and forcing reindexing...');
    
    try {
        // First, check if RAG backend is running
        const healthCheck = await fetchData('http://localhost:8000/docs');
        if (!healthCheck.ok) {
            console.log('❌ RAG backend is not running on port 8000');
            console.log('Please start it with: python rag_backend_agent_specific.py');
            return;
        }
        
        console.log('✅ RAG backend is running');
        
        // Get agent files and trigger reprocessing
        const agents = [6, 8]; // Your current agents
        
        for (const agentId of agents) {
            console.log(`\n📁 Processing agent ${agentId}:`);
            
            // Check agent files endpoint
            try {
                const filesResponse = await fetchData(`http://localhost:8000/agent-files/${agentId}`);
                const filesData = await filesResponse.json();
                console.log(`   Files for agent ${agentId}:`, filesData);
                
                // Trigger a test query to rebuild the index
                const queryResponse = await fetchData('http://localhost:8000/query/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: 'test query to rebuild index',
                        agent_id: agentId.toString()
                    })
                });
                
                const queryData = await queryResponse.json();
                console.log(`   ✅ Agent ${agentId} index rebuilt. Source:`, queryData.source);
                
            } catch (err) {
                console.log(`   ❌ Error processing agent ${agentId}:`, err.message);
            }
        }
        
        console.log('\n🎉 RAG cache clearing completed!');
        console.log('\nNext steps:');
        console.log('1. Test agent 6: http://localhost:3000/chat/6');
        console.log('2. Test agent 8: http://localhost:3000/chat/8');
        console.log('3. Verify they show different document references');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\nTroubleshooting:');
        console.log('1. Make sure RAG backend is running: python rag_backend_agent_specific.py');
        console.log('2. Check if port 8000 is available');
    }
}

clearRagCache();
