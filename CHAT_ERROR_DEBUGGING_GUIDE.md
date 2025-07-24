# Chat Error Debugging Guide

## Comprehensive Logging Added

### 1. Frontend Chat Page (`app/chat/[id]/page.tsx`)
**Enhanced logging for:**
- Agent loading process with detailed status tracking
- Settings retrieval and processing
- Chat message sending with payload details
- API response analysis
- Error handling with development mode debugging

**Key logs to monitor:**
```
Chat: Loading agent data for ID: {agentId}
Chat: Agent data received: {agentCount, agents}
Chat: Current agent found: {found, agent}
Chat: Settings data received: {hasSettings, settingsCount, settings}
Chat: Sending message: {agentId, agentName, message, currentSettings}
Chat: API response received: {status, statusText, ok, headers}
Chat: API response data: {hasResponse, hasError, responseLength, errorMessage, fullData}
```

### 2. Chat API Route (`app/api/chat/route.ts`)
**Enhanced logging for:**
- Request parsing and validation
- RAG backend communication
- Response processing
- Error categorization (connection vs other errors)

**Key logs to monitor:**
```
Chat API: Request received
Chat API: Request body parsed: {hasMessages, messageCount, hasAgentId, agentId, agentName}
Chat API: Sending to RAG backend: {url, payload}
Chat API: RAG backend response: {status, statusText, ok, headers}
Chat API: RAG backend data: {hasResponse, responseLength, hasError, errorMessage, source}
```

### 3. Agent Settings API (`app/api/agent-settings/route.ts`)
**Enhanced logging for:**
- Agent lookup by ID or name
- Settings query execution
- Results processing

**Key logs to monitor:**
```
Agent Settings API: GET request: {id, name}
Agent Settings API: Settings query result: {agentId, settingsCount, settings}
```

### 4. Agents API (`app/api/agents/route.ts`)
**Enhanced logging for:**
- Agent fetching
- Agent creation
- Database operations

**Key logs to monitor:**
```
Agents API: GET request received
Agents API: Query result: {agentCount, agents}
Agents API: POST request: {name, display_name, description, rag_architecture}
```

## Common Issues and Debugging Steps

### Issue 1: "Sorry, I encountered an error. Please try again"

**Debugging Steps:**

1. **Check Browser Console:**
   - Open DevTools (F12) → Console tab
   - Look for detailed error logs starting with "Chat:", "Chat API:", etc.

2. **Check Network Tab:**
   - Look for failed API calls to `/api/chat`, `/api/agents`, `/api/agent-settings`
   - Check response status codes and error messages

3. **Check Server Console:**
   - Monitor terminal running `npm run dev`
   - Look for API logs and error details

### Issue 2: Agent Not Found

**Debugging Steps:**
1. Check console for: `Chat: Agent not found`
2. Verify agent ID in URL matches database
3. Check `Agents API: Query result` for available agents

### Issue 3: Settings Not Loading

**Debugging Steps:**
1. Check console for: `Agent Settings API: Settings query result`
2. Verify agent has settings in database
3. Check if default settings are being used

### Issue 4: RAG Backend Connection

**Debugging Steps:**
1. Check console for: `Chat API: RAG Backend fetch error`
2. Look for connection errors (ECONNREFUSED)
3. Verify FastAPI server is running on http://localhost:8000

**Common RAG Backend Errors:**
- `ECONNREFUSED`: FastAPI server not running
- `fetch failed`: Network connectivity issues
- `500 Internal Server Error`: RAG backend processing error

## Testing Checklist

### Before Testing:
1. **Database Setup:**
   ```bash
   node test-database-setup.js
   ```
   - Verify tables exist
   - Check agent data
   - Confirm schema updates

2. **Start Services:**
   ```bash
   # Terminal 1: Next.js
   npm run dev
   
   # Terminal 2: RAG Backend (if using)
   python rag_backend_agent_specific.py
   ```

### During Testing:
1. **Open Browser DevTools** (F12) before navigating to chat
2. **Monitor Console Tab** for detailed logs
3. **Check Network Tab** for API call status
4. **Note specific error patterns**

### Test Scenarios:

#### Scenario 1: Basic Chat Functionality
1. Navigate to `/chat/1` (replace 1 with valid agent ID)
2. Check console for agent loading logs
3. Send a test message
4. Monitor chat sending and API response logs

#### Scenario 2: Agent-Specific Context
1. Create multiple agents with different settings
2. Upload different files to each agent
3. Test chat responses use correct context

#### Scenario 3: Error Handling
1. Test with invalid agent ID
2. Test with RAG backend offline
3. Test with empty message

## Expected Log Flow (Successful Chat)

1. **Page Load:**
   ```
   Chat: Loading agent data for ID: 1
   Agents API: GET request received
   Agents API: Query result: {agentCount: 3, agents: [...]}
   Chat: Agent data received: {agentCount: 3, agents: [...]}
   Chat: Current agent found: {found: true, agent: {...}}
   Agent Settings API: GET request: {id: "1", name: null}
   Agent Settings API: Settings query result: {agentId: "1", settingsCount: 8, settings: [...]}
   Chat: Settings data received: {hasSettings: true, settingsCount: 8, settings: [...]}
   Chat: Agent loading completed
   ```

2. **Send Message:**
   ```
   Chat: Sending message: {agentId: "1", agentName: "test-agent", message: "Hello", currentSettings: {...}}
   Chat: Sending payload to /api/chat: {payloadSize: 1234, agentId: "1", messageCount: 1, ...}
   Chat API: Request received
   Chat API: Request body parsed: {hasMessages: true, messageCount: 1, hasAgentId: true, agentId: "1", ...}
   Chat API: Sending to RAG backend: {url: "http://localhost:8000/query/", payload: {...}}
   Chat API: RAG backend response: {status: 200, statusText: "OK", ok: true, ...}
   Chat API: RAG backend data: {hasResponse: true, responseLength: 156, hasError: false, ...}
   Chat: API response received: {status: 200, statusText: "OK", ok: true, ...}
   Chat: API response data: {hasResponse: true, hasError: false, responseLength: 156, ...}
   Chat: Bot message added successfully: {botName: "Test Agent", responseLength: 156}
   Chat: Send operation completed
   ```

## Quick Fixes for Common Issues

1. **Agent Not Found:**
   - Check if agent exists: `SELECT * FROM agents WHERE id = 1`
   - Verify agent ID in URL

2. **No Settings:**
   - Insert default settings for agent
   - Check if agent_settings table exists

3. **RAG Backend Error:**
   - Start FastAPI server: `python rag_backend_agent_specific.py`
   - Check port 8000 is available

4. **Database Connection:**
   - Run: `node test-database-setup.js`
   - Check PostgreSQL is running
   - Verify connection parameters

5. **"rag_architecture column does not exist" Error:**
   - Run database migration: `node test-database-setup.js`
   - This will add the missing `rag_architecture` column to the `agents` table
   - Verify with: `node test-agent-creation.js`

6. **NextAuth CLIENT_FETCH_ERROR:**
   - Ensure `NEXTAUTH_URL=http://localhost:3000` is set in `.env.local`
   - Ensure `NEXTAUTH_SECRET` is set with a secure random value
   - Check that only one NextAuth route file exists: `app/api/auth/[...nextauth]/route.ts`
   - Verify Google OAuth credentials are correctly set
   - Restart the development server after env changes

7. **Agent Document Cross-Contamination:**
   - If different agents show the same document references
   - Check file organization: files should be in `data/agents/{agent_id}/`
   - Clear RAG cache: `node clear-rag-cache.js`
   - Verify Pinecone namespaces are agent-specific: `agent_{agent_id}`
   - Ensure files are uploaded via agent-specific file manager

8. **RAG Backend 500 Internal Server Error:**
   - **AssertionError in vector store**: 
     - Caused by empty/uninitialized Pinecone index
     - Use working backend: `start_working_backend.bat` or `python working_rag_backend.py`
   - **Wrong backend file running**: Ensure you're using the correct backend:
     ```powershell
     # Use the working backend (recommended)
     start_working_backend.bat
     
     # OR use startup manager
     python start_correct_backend.py
     
     # OR manually start working backend
     python working_rag_backend.py
     ```
   - **"No files found in data" error**: 
     - This happens with old `rag_backend.py` (now fixed)
     - Use `working_rag_backend.py` for immediate functionality
   - **Check if RAG backend is running**: `netstat -an | findstr :8000`
   - **Missing environment variables**: Ensure `.env.local` has:
     ```
     OPENAI_API_KEY=sk-your-actual-openai-key-here
     PINECONE_API_KEY=your-pinecone-key
     PINECONE_INDEX_NAME=llamaindex-demo
     ```

## Next Steps After Debugging

Once you identify the specific error from the logs:

1. **Connection Issues**: Fix database/RAG backend connectivity
2. **Data Issues**: Update database schema or insert missing data
3. **Logic Issues**: Review API logic and fix business logic errors
4. **Configuration Issues**: Update environment variables or settings

The enhanced logging will pinpoint exactly where the failure occurs, making it much easier to identify and fix the root cause.
