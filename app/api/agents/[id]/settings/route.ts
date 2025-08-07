import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;
    
    // Forward request to enhanced_rag_backend
    const response = await fetch(`http://localhost:8000/agents/${agentId}/settings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch agent settings' },
        { status: response.status }
      );
    }
    
    const settings = await response.json();
    return NextResponse.json(settings);
    
  } catch (error) {
    console.error('Error fetching agent settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = params.id;
    const settings = await request.json();
    
    // Forward request to enhanced_rag_backend
    const response = await fetch(`http://localhost:8000/agents/${agentId}/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to save agent settings' },
        { status: response.status }
      );
    }
    
    const result = await response.json();
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error saving agent settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
