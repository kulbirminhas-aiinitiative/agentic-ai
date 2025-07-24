import { NextRequest, NextResponse } from "next/server";

// This now calls the FastAPI backend for RAG responses
export async function POST(req: NextRequest) {
  const { messages, model, temperature, top_p, top_k, max_tokens, frequency_penalty, presence_penalty, stop_sequences } = await req.json();
  const lastUserMsg = messages.filter((m: any) => m.role === "user").pop()?.content || "";

  try {
    const fastapiRes = await fetch("http://localhost:8000/query/", {
      method: "POST",
      headers: { "accept": "application/json" },
      body: new URLSearchParams({
        query: lastUserMsg,
        model: model || "gpt-4o",
        temperature: temperature?.toString() || "0.7",
        top_p: top_p?.toString() || "1",
        top_k: top_k?.toString() || "0",
        max_tokens: max_tokens?.toString() || "512",
        frequency_penalty: frequency_penalty?.toString() || "0",
        presence_penalty: presence_penalty?.toString() || "0",
        stop_sequences: stop_sequences || ""
      }),
    });
    const data = await fastapiRes.json();
    return NextResponse.json({ response: data.response || "(No response)" });
  } catch (err) {
    return NextResponse.json({ response: "Error connecting to backend: " + String(err) });
  }
}
