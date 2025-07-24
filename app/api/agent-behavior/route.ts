import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const AGENT_BEHAVIOR_PATH = path.join(process.cwd(), "agent_behavior.json");

function readBehavior() {
  if (!fs.existsSync(AGENT_BEHAVIOR_PATH)) {
    fs.writeFileSync(AGENT_BEHAVIOR_PATH, JSON.stringify({ intents: [], responses: [], actions: [], memoryTurns: 5 }, null, 2));
  }
  return JSON.parse(fs.readFileSync(AGENT_BEHAVIOR_PATH, "utf-8"));
}

function writeBehavior(data: any) {
  fs.writeFileSync(AGENT_BEHAVIOR_PATH, JSON.stringify(data, null, 2));
}

export async function GET() {
  return NextResponse.json(readBehavior());
}

export async function POST(req: NextRequest) {
  const { type, value } = await req.json();
  const data = readBehavior();
  if (type === "intent" && value) {
    data.intents.push(value);
  } else if (type === "response" && value) {
    data.responses.push(value);
  } else if (type === "action" && value) {
    data.actions.push(value);
  } else if (type === "memoryTurns" && value) {
    data.memoryTurns = value;
  }
  writeBehavior(data);
  return NextResponse.json({ success: true, data });
}

export async function DELETE(req: NextRequest) {
  const { type, value } = await req.json();
  const data = readBehavior();
  if (type && value) {
    if (Array.isArray(data[type])) {
      data[type] = data[type].filter((v: any) => v !== value);
    }
    writeBehavior(data);
  }
  return NextResponse.json({ success: true, data });
}
