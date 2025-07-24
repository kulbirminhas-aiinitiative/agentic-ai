-- Migration: Create agent_files table for agent-specific file management
CREATE TABLE IF NOT EXISTS agent_files (
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
);

-- Create indexes for better performance
CREATE INDEX idx_agent_files_agent_id ON agent_files(agent_id);
CREATE INDEX idx_agent_files_status ON agent_files(upload_status);
CREATE INDEX idx_agent_files_processing ON agent_files(processing_status);
CREATE INDEX idx_agent_files_filename ON agent_files(filename);

-- Create trigger to update updated_at
CREATE TRIGGER update_agent_files_updated_at BEFORE UPDATE ON agent_files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
