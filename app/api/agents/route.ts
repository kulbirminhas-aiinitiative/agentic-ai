import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Frontend Agents API: Proxying to backend');
    
    // Proxy request to the backend API
    const response = await fetch('http://localhost:8000/agents');
    
    if (!response.ok) {
      console.error('Backend API error:', response.status, response.statusText);
      return NextResponse.json({ error: 'Backend API unavailable' }, { status: 500 });
    }
    
    const agents = await response.json();
    console.log('Frontend Agents API: Retrieved agents from backend', agents.length);
    
    return NextResponse.json(agents);
  } catch (error) {
    console.error('Frontend Agents API: Error proxying to backend:', error);
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Frontend Agents API: Proxying POST to backend');
    
    // Proxy request to the backend API
    const response = await fetch('http://localhost:8000/agents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      console.error('Backend API error:', response.status, response.statusText);
      return NextResponse.json({ error: 'Backend API unavailable' }, { status: 500 });
    }
    
    const result = await response.json();
    console.log('Frontend Agents API: Created agent via backend');
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Frontend Agents API: Error proxying POST to backend:', error);
    return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 });
  }
}
