-- Migration: Create agent_settings table for per-agent settings
CREATE TABLE IF NOT EXISTS agent_settings (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  setting_key VARCHAR(64) NOT NULL,
  setting_value JSONB,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(agent_id, setting_key)
);
