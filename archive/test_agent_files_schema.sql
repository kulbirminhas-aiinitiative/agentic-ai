-- Test database migration and verify agent-specific RAG setup
\c agentic_ai

-- Apply the migrations
\i app/api/migrations/004_create_agent_files.sql
\i app/api/migrations/005_add_rag_architecture.sql

-- Check the new schema
\d agents
\d agent_files

-- Verify sample data
SELECT id, name, display_name, rag_architecture FROM agents;

-- Insert a test file record (simulating an upload)
INSERT INTO agent_files (agent_id, filename, original_filename, file_path, file_size, file_type, mime_type)
VALUES (
  (SELECT id FROM agents LIMIT 1),
  'test_doc_123.pdf',
  'test_document.pdf',
  '/uploads/agents/1/test_doc_123.pdf',
  1024000,
  '.pdf',
  'application/pdf'
);

-- Verify the file was inserted
SELECT af.*, a.name as agent_name 
FROM agent_files af 
JOIN agents a ON af.agent_id = a.id;
