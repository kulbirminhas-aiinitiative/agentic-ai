import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "data");

export async function GET() {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
    const files = fs.readdirSync(UPLOAD_DIR);
    return NextResponse.json({ files });
  } catch (err) {
    return NextResponse.json({ files: [], error: String(err) });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const file = searchParams.get("file");
  if (!file) return NextResponse.json({ error: "No file specified" }, { status: 400 });
  try {
    const filePath = path.join(UPLOAD_DIR, file);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
