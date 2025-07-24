import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ANALYTICS_PATH = path.join(process.cwd(), "analytics.json");

function readAnalytics() {
  if (!fs.existsSync(ANALYTICS_PATH)) {
    const defaultData = {
      conversations: [
        { timestamp: new Date().toISOString(), user: "User1", message: "Hello, how can you help me?" },
        { timestamp: new Date().toISOString(), user: "User2", message: "What are your capabilities?" }
      ],
      performance: { totalConversations: 156, avgResponseTime: 250, successRate: 98.5 },
      feedback: { 
        avgRating: 4.3, 
        totalReviews: 42, 
        recentFeedback: [
          { rating: 5, comment: "Very helpful!" },
          { rating: 4, comment: "Good responses, could be faster" }
        ]
      },
      errors: { 
        totalErrors: 3, 
        recentErrors: [
          { timestamp: new Date().toISOString(), message: "API timeout error" }
        ]
      },
      costs: { totalCost: 24.65, thisMonth: 8.32, tokensUsed: 12450 }
    };
    fs.writeFileSync(ANALYTICS_PATH, JSON.stringify(defaultData, null, 2));
  }
  return JSON.parse(fs.readFileSync(ANALYTICS_PATH, "utf-8"));
}

function writeAnalytics(data: any) {
  fs.writeFileSync(ANALYTICS_PATH, JSON.stringify(data, null, 2));
}

export async function GET(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const analytics = readAnalytics();
  
  if (pathname.includes('conversations')) {
    return NextResponse.json({ logs: analytics.conversations });
  } else if (pathname.includes('performance')) {
    return NextResponse.json(analytics.performance);
  } else if (pathname.includes('feedback')) {
    return NextResponse.json(analytics.feedback);
  } else if (pathname.includes('errors')) {
    return NextResponse.json(analytics.errors);
  } else if (pathname.includes('costs')) {
    return NextResponse.json(analytics.costs);
  }
  
  return NextResponse.json(analytics);
}

export async function POST(req: NextRequest) {
  const { type, data: newData } = await req.json();
  const analytics = readAnalytics();
  
  if (type === 'conversation') {
    analytics.conversations.push(newData);
  } else if (type === 'feedback') {
    analytics.feedback.recentFeedback.push(newData);
    analytics.feedback.totalReviews++;
  } else if (type === 'error') {
    analytics.errors.recentErrors.push(newData);
    analytics.errors.totalErrors++;
  }
  
  writeAnalytics(analytics);
  return NextResponse.json({ success: true });
}