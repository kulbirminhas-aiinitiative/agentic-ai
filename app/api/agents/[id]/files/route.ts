import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;
    
    console.log(`Frontend Agent Files API: Getting files for agent ${agentId}`);
    
    // Forward request to the enhanced_rag_backend
    const response = await fetch(`http://localhost:8000/frontend-compatible-files/${agentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error('Backend API error:', response.status, response.statusText);
      return NextResponse.json({ files: [], error: 'Backend API unavailable' }, { status: 500 });
    }
    
    const data = await response.json();
    console.log(`Frontend Agent Files API: Retrieved ${data.files?.length || 0} files for agent ${agentId}`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Frontend Agent Files API: Error:', error);
    return NextResponse.json({ files: [], error: 'Failed to fetch agent files' }, { status: 500 });
  }
}
