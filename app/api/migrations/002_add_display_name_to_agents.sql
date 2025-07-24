-- Migration: Add display_name column to agents table
ALTER TABLE agents ADD COLUMN IF NOT EXISTS display_name VARCHAR(128);
