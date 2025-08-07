// db.ts - Postgres connection utility for agentic-ai
import { Pool } from 'pg';

const pool = new Pool({
  user: 'kulbirminhas',
  host: 'localhost',
  database: 'agentic_ai',
  password: '',
  port: 5432,
});

export default pool;
