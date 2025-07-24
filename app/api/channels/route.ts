import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CHANNELS_PATH = path.join(process.cwd(), "channels.json");

function readChannels() {
  if (!fs.existsSync(CHANNELS_PATH)) {
    fs.writeFileSync(CHANNELS_PATH, JSON.stringify({ outlook: [], gmail: [], whatsapp: [], slack: [], webhooks: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(CHANNELS_PATH, "utf-8"));
}

function writeChannels(data: any) {
  fs.writeFileSync(CHANNELS_PATH, JSON.stringify(data, null, 2));
}

export async function GET() {
  return NextResponse.json(readChannels());
}

export async function POST(req: NextRequest) {
  const { type, value } = await req.json();
  const data = readChannels();
  if (type && value) {
    data[type] = [...(data[type] || []), value];
    writeChannels(data);
  }
  return NextResponse.json({ success: true, data });
}

export async function DELETE(req: NextRequest) {
  const { type, value } = await req.json();
  const data = readChannels();
  if (type && value) {
    data[type] = (data[type] || []).filter((v: string) => v !== value);
    writeChannels(data);
  }
  return NextResponse.json({ success: true, data });
}
