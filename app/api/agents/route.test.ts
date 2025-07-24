import { POST } from './route';
import { NextRequest } from 'next/server';

// Mock the pool.query method
jest.mock('../db', () => ({
  __esModule: true,
  default: {
    query: jest.fn(async (query, params) => ({
      rows: [{ id: 1, name: params[0], display_name: params[1], description: params[2], created_at: new Date() }],
    })),
  },
}));

describe('POST /api/agents', () => {
  it('creates an agent with name, display_name, and description', async () => {
    const req = {
      json: async () => ({ name: 'Test', display_name: 'Test Agent', description: 'desc' })
    } as unknown as NextRequest;
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(201);
    expect(data.agent).toMatchObject({ name: 'Test', display_name: 'Test Agent', description: 'desc' });
  });

  it('returns 400 if name is missing', async () => {
    const req = {
      json: async () => ({ display_name: 'Test Agent', description: 'desc' })
    } as unknown as NextRequest;
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toBe('Name is required');
  });
});
