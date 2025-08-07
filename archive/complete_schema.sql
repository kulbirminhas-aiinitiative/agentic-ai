-- Complete SQL Schema for Agentic AI Platform
-- Run this in PostgreSQL to create the necessary tables and sample data

-- Drop existing tables if they exist (for development)
DROP TABLE IF EXISTS agent_files CASCADE;
DROP TABLE IF EXISTS agent_settings CASCADE;
DROP TABLE IF EXISTS agents CASCADE;

-- Create agents table
CREATE TABLE agents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    rag_architecture VARCHAR(50) DEFAULT 'llamaindex-pinecone',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Create agent_settings table
CREATE TABLE agent_settings (
    id SERIAL PRIMARY KEY,
    agent_id INTEGER REFERENCES agents(id) ON DELETE CASCADE,
    setting_key VARCHAR(255) NOT NULL,
    setting_value JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(agent_id, setting_key)
);

-- Create agent_files table for file management
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
);

-- Create indexes for better performance
CREATE INDEX idx_agents_name ON agents(name);
CREATE INDEX idx_agents_active ON agents(is_active);
CREATE INDEX idx_agents_rag_arch ON agents(rag_architecture);
CREATE INDEX idx_agent_settings_agent_id ON agent_settings(agent_id);
CREATE INDEX idx_agent_settings_key ON agent_settings(setting_key);
CREATE INDEX idx_agent_files_agent_id ON agent_files(agent_id);
CREATE INDEX idx_agent_files_status ON agent_files(upload_status);
CREATE INDEX idx_agent_files_processing ON agent_files(processing_status);
CREATE INDEX idx_agent_files_filename ON agent_files(filename);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_settings_updated_at BEFORE UPDATE ON agent_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_files_updated_at BEFORE UPDATE ON agent_files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert comprehensive sample data
INSERT INTO agents (name, display_name, description, rag_architecture) VALUES 
('customer-support', 'Customer Support Agent', 'Handles customer inquiries and support tickets', 'llamaindex-pinecone'),
('sales-assistant', 'Sales Assistant', 'Helps with sales processes and lead qualification', 'rerank-rag'),
('content-creator', 'Content Creator', 'Generates marketing content and blog posts', 'corrective-rag'),
('technical-writer', 'Technical Writer', 'Creates documentation and technical guides', 'graph-rag'),
('data-analyst', 'Data Analyst', 'Analyzes data and generates insights', 'hyde-rag'),
('hr-assistant', 'HR Assistant', 'Assists with human resources tasks and employee queries', 'self-rag'),
('project-manager', 'Project Manager', 'Helps manage projects and coordinate tasks', 'agentic-rag'),
('legal-advisor', 'Legal Advisor', 'Provides legal guidance and document review', 'baseline-rag'),
('financial-analyst', 'Financial Analyst', 'Analyzes financial data and market trends', 'llamaindex-pinecone'),
('marketing-strategist', 'Marketing Strategist', 'Develops marketing strategies and campaigns', 'rerank-rag');

-- Insert detailed agent settings for each agent
INSERT INTO agent_settings (agent_id, setting_key, setting_value) VALUES 
-- Customer Support Agent settings
(1, 'model', '"gpt-4o"'),
(1, 'temperature', '0.7'),
(1, 'max_tokens', '512'),
(1, 'system_prompt', '"You are a helpful customer support agent. Be friendly, professional, and solution-oriented."'),
(1, 'top_p', '0.9'),
(1, 'top_k', '40'),

-- Sales Assistant settings
(2, 'model', '"gpt-4"'),
(2, 'temperature', '0.5'),
(2, 'max_tokens', '1024'),
(2, 'system_prompt', '"You are a sales assistant focused on helping customers find the right solutions."'),
(2, 'top_p', '0.8'),
(2, 'top_k', '50'),

-- Content Creator settings
(3, 'model', '"gpt-4o"'),
(3, 'temperature', '0.8'),
(3, 'max_tokens', '2048'),
(3, 'system_prompt', '"You are a creative content writer. Generate engaging, original content."'),
(3, 'top_p', '0.95'),
(3, 'top_k', '60'),

-- Technical Writer settings
(4, 'model', '"gpt-4"'),
(4, 'temperature', '0.3'),
(4, 'max_tokens', '1500'),
(4, 'system_prompt', '"You are a technical writer. Create clear, precise, and well-structured documentation."'),
(4, 'top_p', '0.7'),
(4, 'top_k', '30'),

-- Data Analyst settings
(5, 'model', '"gpt-4o"'),
(5, 'temperature', '0.2'),
(5, 'max_tokens', '1200'),
(5, 'system_prompt', '"You are a data analyst. Provide accurate, data-driven insights and analysis."'),
(5, 'top_p', '0.6'),
(5, 'top_k', '25'),

-- HR Assistant settings
(6, 'model', '"gpt-4"'),
(6, 'temperature', '0.6'),
(6, 'max_tokens', '800'),
(6, 'system_prompt', '"You are an HR assistant. Be empathetic, professional, and knowledgeable about HR policies."'),
(6, 'top_p', '0.85'),
(6, 'top_k', '45'),

-- Project Manager settings
(7, 'model', '"gpt-4o"'),
(7, 'temperature', '0.4'),
(7, 'max_tokens', '1000'),
(7, 'system_prompt', '"You are a project manager. Help organize tasks, set priorities, and coordinate team efforts."'),
(7, 'top_p', '0.8'),
(7, 'top_k', '35'),

-- Legal Advisor settings
(8, 'model', '"gpt-4"'),
(8, 'temperature', '0.1'),
(8, 'max_tokens', '1500'),
(8, 'system_prompt', '"You are a legal advisor. Provide accurate legal information while noting you are not a substitute for professional legal counsel."'),
(8, 'top_p', '0.5'),
(8, 'top_k', '20'),

-- Financial Analyst settings
(9, 'model', '"gpt-4o"'),
(9, 'temperature', '0.3'),
(9, 'max_tokens', '1200'),
(9, 'system_prompt', '"You are a financial analyst. Provide accurate financial insights and market analysis."'),
(9, 'top_p', '0.7'),
(9, 'top_k', '30'),

-- Marketing Strategist settings
(10, 'model', '"gpt-4"'),
(10, 'temperature', '0.7'),
(10, 'max_tokens', '1500'),
(10, 'system_prompt', '"You are a marketing strategist. Develop creative and effective marketing strategies."'),
(10, 'top_p', '0.9'),
(10, 'top_k', '50');

-- Insert sample agent files
INSERT INTO agent_files (agent_id, filename, original_filename, file_path, file_size, file_type, mime_type, upload_status, processing_status) VALUES 
-- Customer Support files
(1, 'support-guidelines.pdf', 'Customer Support Guidelines.pdf', 'data/agents/customer-support/support-guidelines.pdf', 245760, 'PDF', 'application/pdf', 'uploaded', 'processed'),
(1, 'faq-database.txt', 'FAQ Database.txt', 'data/agents/customer-support/faq-database.txt', 15420, 'TXT', 'text/plain', 'uploaded', 'processed'),
(1, 'escalation-procedures.md', 'Escalation Procedures.md', 'data/agents/customer-support/escalation-procedures.md', 8960, 'MD', 'text/markdown', 'uploaded', 'processed'),

-- Sales Assistant files
(2, 'sales-playbook.pdf', 'Sales Playbook 2024.pdf', 'data/agents/sales-assistant/sales-playbook.pdf', 512000, 'PDF', 'application/pdf', 'uploaded', 'processed'),
(2, 'lead-qualification.xlsx', 'Lead Qualification Criteria.xlsx', 'data/agents/sales-assistant/lead-qualification.xlsx', 28740, 'XLSX', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'uploaded', 'pending'),

-- Content Creator files
(3, 'content-style-guide.pdf', 'Content Style Guide.pdf', 'data/agents/content-creator/content-style-guide.pdf', 198400, 'PDF', 'application/pdf', 'uploaded', 'processed'),
(3, 'brand-voice.md', 'Brand Voice Guidelines.md', 'data/agents/content-creator/brand-voice.md', 12300, 'MD', 'text/markdown', 'uploaded', 'processed'),
(3, 'content-templates.docx', 'Content Templates.docx', 'data/agents/content-creator/content-templates.docx', 45600, 'DOCX', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'uploaded', 'processing'),

-- Technical Writer files
(4, 'api-documentation.md', 'API Documentation.md', 'data/agents/technical-writer/api-documentation.md', 67800, 'MD', 'text/markdown', 'uploaded', 'processed'),
(4, 'writing-standards.pdf', 'Technical Writing Standards.pdf', 'data/agents/technical-writer/writing-standards.pdf', 156000, 'PDF', 'application/pdf', 'uploaded', 'processed'),

-- Data Analyst files
(5, 'data-dictionary.xlsx', 'Data Dictionary.xlsx', 'data/agents/data-analyst/data-dictionary.xlsx', 89400, 'XLSX', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'uploaded', 'processed'),
(5, 'analysis-templates.csv', 'Analysis Templates.csv', 'data/agents/data-analyst/analysis-templates.csv', 34200, 'CSV', 'text/csv', 'uploaded', 'processed');

-- Display summary of inserted data
SELECT 
    'Agents' as table_name,
    COUNT(*) as record_count
FROM agents
UNION ALL
SELECT 
    'Agent Settings' as table_name,
    COUNT(*) as record_count
FROM agent_settings
UNION ALL
SELECT 
    'Agent Files' as table_name,
    COUNT(*) as record_count
FROM agent_files
ORDER BY table_name;

-- Show agent summary
SELECT 
    id,
    name,
    display_name,
    rag_architecture,
    (SELECT COUNT(*) FROM agent_settings WHERE agent_id = agents.id) as settings_count,
    (SELECT COUNT(*) FROM agent_files WHERE agent_id = agents.id) as files_count,
    created_at
FROM agents
ORDER BY id;
