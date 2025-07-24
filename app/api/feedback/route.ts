// API route for user feedback (stub)
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // This is a stub for submitting user feedback
  // In production, you would store feedback in a database
  return NextResponse.json({ message: 'User feedback feature coming soon.' }, { status: 200 });
}
