import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const { type, value } = await req.json();
  // type: 'db', 'api', 'scrape'; value: connection string, api url, or scrape url
  const configPath = path.join(process.cwd(), "data_sources.json");
  let config = { db: [], api: [], scrape: [] };
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  }
  if (type && value) {
    config[type] = [...(config[type] || []), value];
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }
  return NextResponse.json({ success: true, config });
}

export async function GET() {
  const configPath = path.join(process.cwd(), "data_sources.json");
  let config = { db: [], api: [], scrape: [] };
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  }
  return NextResponse.json(config);
}

export async function DELETE(req: NextRequest) {
  const { type, value } = await req.json();
  const configPath = path.join(process.cwd(), "data_sources.json");
  let config = { db: [], api: [], scrape: [] };
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  }
  if (type && value) {
    config[type] = (config[type] || []).filter((v: string) => v !== value);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  }
  return NextResponse.json({ success: true, config });
}
