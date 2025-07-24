import { NextRequest, NextResponse } from "next/server";

// This now calls the FastAPI backend for RAG responses with agent-specific context
export async function POST(req: NextRequest) {
  console.log('Chat API: Request received');
  
  try {
    const body = await req.json();
    console.log('Chat API: Request body parsed', {
      hasMessages: !!body.messages,
      messageCount: body.messages?.length || 0,
      hasAgentId: !!body.agent_id,
      agentId: body.agent_id,
      agentName: body.agent_name,
      model: body.model,
      temperature: body.temperature
    });

    const { 
      messages, 
      model, 
      temperature, 
      top_p, 
      top_k, 
      max_tokens, 
      frequency_penalty, 
      presence_penalty, 
      stop_sequences,
      agent_id,
      agent_name 
    } = body;
    
    const lastUserMsg = messages?.filter((m: any) => m.role === "user").pop()?.content || "";
    console.log('Chat API: Extracted last user message', {
      lastUserMsg: lastUserMsg.substring(0, 100) + (lastUserMsg.length > 100 ? '...' : ''),
      fullLength: lastUserMsg.length
    });

    const ragPayload = {
      query: lastUserMsg,
      agent_id: agent_id || null,
      model: model || "gpt-4o",
      temperature: temperature?.toString() || "0.7",
      top_p: top_p?.toString() || "1",
      top_k: top_k?.toString() || "0",
      max_tokens: max_tokens?.toString() || "512",
      frequency_penalty: frequency_penalty?.toString() || "0",
      presence_penalty: presence_penalty?.toString() || "0",
      stop_sequences: stop_sequences || ""
    };

    console.log('Chat API: Sending to RAG backend', {
      url: 'http://localhost:8000/query/',
      payload: ragPayload
    });

    try {
      const fastapiRes = await fetch("http://localhost:8000/query/", {
        method: "POST",
        headers: { 
          "accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(ragPayload),
      });
      
      console.log('Chat API: RAG backend response', {
        status: fastapiRes.status,
        statusText: fastapiRes.statusText,
        ok: fastapiRes.ok,
        headers: Object.fromEntries(fastapiRes.headers.entries())
      });

      if (!fastapiRes.ok) {
        throw new Error(`RAG backend returned ${fastapiRes.status}: ${fastapiRes.statusText}`);
      }
      
      const data = await fastapiRes.json();
      console.log('Chat API: RAG backend data', {
        hasResponse: !!data.response,
        responseLength: data.response?.length || 0,
        hasError: !!data.error,
        errorMessage: data.error,
        source: data.source,
        model: data.model,
        fullData: data
      });
      
      // Add agent context to response
      const response = {
        response: data.response || "(No response)",
        agent_id: agent_id,
        agent_name: agent_name,
        source: data.source || "unknown",
        model: data.model || model,
        debug: process.env.NODE_ENV === 'development' ? {
          ragPayload,
          ragResponse: data
        } : undefined
      };
      
      console.log('Chat API: Sending final response', {
        hasResponse: !!response.response,
        responseLength: response.response?.length || 0,
        source: response.source
      });
      
      return NextResponse.json(response);
      
    } catch (fetchErr) {
      console.error('Chat API: RAG Backend fetch error', {
        error: fetchErr,
        errorMessage: fetchErr instanceof Error ? fetchErr.message : String(fetchErr),
        stack: fetchErr instanceof Error ? fetchErr.stack : undefined,
        ragPayload
      });
      
      // Check if it's a connection error
      const isConnectionError = fetchErr instanceof Error && 
        (fetchErr.message.includes('ECONNREFUSED') || 
         fetchErr.message.includes('fetch failed') ||
         fetchErr.message.includes('network'));
      
      const errorResponse = {
        response: isConnectionError 
          ? `RAG backend is not available. Please ensure the FastAPI server is running on http://localhost:8000. Original error: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}`
          : `Error connecting to RAG backend: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}`,
        agent_id: agent_id,
        agent_name: agent_name,
        error: true,
        debug: process.env.NODE_ENV === 'development' ? {
          errorType: isConnectionError ? 'connection' : 'other',
          originalError: String(fetchErr),
          ragPayload
        } : undefined
      };
      
      return NextResponse.json(errorResponse);
    }
    
  } catch (err) {
    console.error('Chat API: General error', {
      error: err,
      errorMessage: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    });
    
    return NextResponse.json({ 
      response: `Server error: ${err instanceof Error ? err.message : String(err)}`,
      error: true,
      debug: process.env.NODE_ENV === 'development' ? {
        errorType: 'server',
        originalError: String(err)
      } : undefined
    }, { status: 500 });
  }
}
