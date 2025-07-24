-- SQL Schema for Agentic AI Platform
-- Run this in PostgreSQL to create the necessary tables

-- Drop existing tables if they exist (for development)
DROP TABLE IF EXISTS agent_settings CASCADE;
DROP TABLE IF EXISTS agents CASCADE;

-- Create agents table
CREATE TABLE agents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
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

-- Create indexes for better performance
CREATE INDEX idx_agents_name ON agents(name);
CREATE INDEX idx_agents_active ON agents(is_active);
CREATE INDEX idx_agent_settings_agent_id ON agent_settings(agent_id);
CREATE INDEX idx_agent_settings_key ON agent_settings(setting_key);

-- Insert sample data
INSERT INTO agents (name, display_name, description) VALUES 
('customer-support', 'Customer Support Agent', 'Handles customer inquiries and support tickets'),
('sales-assistant', 'Sales Assistant', 'Helps with sales processes and lead qualification'),
('content-creator', 'Content Creator', 'Generates marketing content and blog posts');

-- Insert sample settings
INSERT INTO agent_settings (agent_id, setting_key, setting_value) VALUES 
(1, 'model', '"gpt-4o"'),
(1, 'temperature', '0.7'),
(1, 'max_tokens', '512'),
(1, 'system_prompt', '"You are a helpful customer support agent."'),
(2, 'model', '"gpt-4"'),
(2, 'temperature', '0.5'),
(2, 'max_tokens', '1024'),
(2, 'system_prompt', '"You are a sales assistant focused on helping customers."');

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
