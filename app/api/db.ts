// db.ts - Postgres connection utility for agentic-ai
import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'agentic_ai',
  password: 'qKiaZpWa5FUR&H',
  port: 5432,
});

export default pool;
