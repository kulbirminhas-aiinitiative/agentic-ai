import { NextRequest, NextResponse } from "next/server";
import pinecone from "@/lib/pinecone";

// Example: create a Pinecone index via API route
export async function POST(req: NextRequest) {
  const { indexName, dimension, metric } = await req.json();
  try {
    // Check if index already exists
    const existing = await pinecone.listIndexes();
    if (existing.indexes.some((idx: any) => idx.name === indexName)) {
      return NextResponse.json({ error: "Index already exists" }, { status: 400 });
    }
    // Create index
    await pinecone.createIndex({
      name: indexName,
      dimension,
      metric: metric || "cosine",
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create index" }, { status: 500 });
  }
}
