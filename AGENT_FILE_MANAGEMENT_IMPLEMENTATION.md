# Agent-Specific File Management and RAG Integration

## Overview
Implemented comprehensive agent-specific file management system with RAG (Retrieval-Augmented Generation) integration that links each agent to its specific documents and knowledge base.

## Key Features Implemented

### 1. Database Schema Updates
- **agent_files table**: Tracks uploaded files per agent with metadata
- **RAG architecture field**: Added to agents table to specify RAG workflow
- **Proper indexes**: For performance optimization
- **Foreign key constraints**: Maintain data integrity

### 2. Agent-Specific File Storage
- **Directory Structure**: `uploads/agents/{agent_id}/` for organized file storage
- **Unique Filenames**: Timestamp-based naming to prevent conflicts
- **Multiple File Upload**: Support for uploading multiple files simultaneously
- **File Metadata**: Size, type, processing status tracking

### 3. Enhanced APIs

#### `/api/agent-files`
- **GET**: List files for specific agent
- **POST**: Upload files with agent association
- **DELETE**: Remove agent-specific files
- Integrated with RAG processing pipeline

#### `/api/agents` (Updated)
- **POST**: Create agents with RAG architecture specification
- **RAG Architecture**: Stored per agent (default: 'llamaindex-pinecone')

#### `/api/chat` (Enhanced)
- **Agent Context**: Passes agent_id to RAG backend
- **Source Tracking**: Shows which agent's knowledge base was used

### 4. RAG Backend Integration (`rag_backend_agent_specific.py`)

#### Agent-Specific Processing
- **Namespace Isolation**: Each agent gets separate Pinecone namespace
- **Directory Management**: Agent-specific data directories
- **Index Caching**: In-memory cache for agent indexes
- **Processing Endpoints**: 
  - `/process-agent-file/`: Process files for specific agents
  - `/query/`: Query with agent context
  - `/agent-files/{agent_id}`: List agent files

#### Features
- **Multiple File Support**: Process multiple documents per agent
- **Isolated Knowledge Bases**: Each agent has independent RAG context
- **Fallback Handling**: Graceful handling when no documents exist
- **Error Management**: Clear error messages for missing documents

### 5. Frontend Components

#### `AgentFileManager.tsx`
- **Multi-file Upload**: Drag-and-drop with multiple file selection
- **Progress Tracking**: Individual file upload status
- **File Management**: View, delete, and manage agent-specific files
- **Visual Feedback**: Processing status indicators
- **Responsive Design**: Consistent with design system

#### `KnowledgeBaseSection.tsx` (Updated)
- **Integration**: Uses AgentFileManager for file operations
- **Agent Selection**: Shows files only for selected agent
- **Settings Persistence**: Maintains other knowledge base settings

#### Chat Interface (Enhanced)
- **Agent Context**: Displays current agent's RAG architecture
- **Knowledge Source**: Shows which agent's knowledge base is being used
- **Settings Display**: Enhanced agent information in chat header

### 6. Workflow Integration

#### File Upload Process
1. **File Selection**: Multiple files via drag-drop or file picker
2. **Agent Association**: Files stored in agent-specific directories
3. **Database Recording**: Metadata stored with agent relationship
4. **RAG Processing**: Files sent to agent-specific RAG backend
5. **Status Updates**: Processing status tracked and displayed

#### Chat Process
1. **Agent Loading**: Load agent details including RAG architecture
2. **Context Query**: Send agent_id with chat messages
3. **RAG Retrieval**: Backend uses agent-specific knowledge base
4. **Response Generation**: Context-aware responses with source tracking

## Technical Architecture

### Database Tables
```sql
-- Existing agents table (enhanced)
agents (
  id, name, display_name, description, 
  rag_architecture,  -- NEW: RAG workflow type
  created_at, updated_at, is_active
)

-- New agent_files table
agent_files (
  id, agent_id, filename, original_filename,
  file_path, file_size, file_type, mime_type,
  upload_status, processing_status, processed_at,
  created_at, updated_at
)
```

### File Structure
```
uploads/
  agents/
    {agent_id}/
      document1_timestamp.pdf
      document2_timestamp.docx
      ...
```

### RAG Architecture
```
Agent 1 → Namespace: agent_1 → Documents: [doc1, doc2, ...]
Agent 2 → Namespace: agent_2 → Documents: [doc3, doc4, ...]
```

## Usage Examples

1. **Create Agent with RAG**: Agent created with specific RAG architecture
2. **Upload Files**: Multiple files uploaded to agent-specific directory
3. **RAG Processing**: Files processed into agent's knowledge base
4. **Chat Query**: User chats with agent using agent-specific context
5. **Context Response**: Agent responds based on its uploaded documents

## Benefits

### For Users
- **Isolated Knowledge**: Each agent has its own document context
- **Multi-file Support**: Upload multiple documents efficiently  
- **Visual Management**: Clear file management interface
- **Progress Tracking**: Real-time upload and processing status

### For System
- **Scalability**: Namespace isolation for better performance
- **Organization**: Clean file and data organization
- **Flexibility**: Support for different RAG architectures per agent
- **Maintainability**: Clear separation of concerns

## Next Steps for Production

1. **File Validation**: Add file type and size validation
2. **Storage Optimization**: Implement file compression and deduplication
3. **Batch Processing**: Optimize multiple file processing
4. **Monitoring**: Add logging and analytics for RAG performance
5. **Security**: Implement file scanning and access controls
6. **Backup**: Regular backup of agent-specific data
7. **Scaling**: Move to cloud storage for large deployments

## Testing Verification

To test the implementation:

1. **Start Development Server**: `npm run dev`
2. **Start RAG Backend**: `python rag_backend_agent_specific.py`
3. **Create Agent**: Use AgentManager to create agent with RAG architecture
4. **Upload Files**: Use Knowledge Base section to upload multiple files
5. **Chat Test**: Go to `/chat/{agent_id}` and ask questions about uploaded content
6. **Verify Response**: Confirm agent responds using its specific knowledge base

The system now provides complete agent-specific file management with integrated RAG workflows, enabling each agent to have its own isolated knowledge base and document context.
