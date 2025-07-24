import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadDir = path.join(process.cwd(), "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, file.name);
  await fs.writeFile(filePath, buffer);

  // Trigger background chunking/processing for RAG
  // This could be a local script, API call, or queue message
  // For demonstration, we'll call a local API endpoint (chunking)
  try {
    await fetch("http://localhost:3000/api/chunking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, path: filePath }),
    });
  } catch (err) {
    // Log error but don't block upload response
    console.error("Chunking trigger failed", err);
  }

  return NextResponse.json({ success: true, filename: file.name });
}
