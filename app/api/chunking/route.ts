// API route for data preprocessing/chunking settings (stub)
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Call FastAPI backend to process the uploaded file
  const { filename } = await req.json();
  try {
    const formData = new FormData();
    formData.append("file", await fetch(`http://localhost:3000/uploads/${filename}`).then(r => r.blob()), filename);
    const fastapiRes = await fetch("http://localhost:8000/process-file/", {
      method: "POST",
      body: formData,
    });
    const data = await fastapiRes.json();
    return NextResponse.json({ message: data.status || "Processed" });
  } catch (err) {
    return NextResponse.json({ message: "Error processing file: " + String(err) }, { status: 500 });
  }
}
