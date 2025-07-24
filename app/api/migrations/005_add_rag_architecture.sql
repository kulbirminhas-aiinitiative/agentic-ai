-- Migration: Add RAG architecture field to agents table
ALTER TABLE agents ADD COLUMN IF NOT EXISTS rag_architecture VARCHAR(50) DEFAULT 'llamaindex-pinecone';

-- Update existing agents with default RAG architecture
UPDATE agents SET rag_architecture = 'llamaindex-pinecone' WHERE rag_architecture IS NULL;

-- Add index for RAG architecture lookups
CREATE INDEX IF NOT EXISTS idx_agents_rag_arch ON agents(rag_architecture);
