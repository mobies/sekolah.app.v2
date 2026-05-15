import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json() as any;
    const { userId, type, method, subdomain } = body;
    
    // Validate input
    if (!userId || !type || !method || !subdomain) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const context = getRequestContext();
    const env = context.env as any;
    const queue = env.ATTENDANCE_QUEUE;

    if (!queue) {
      throw new Error("ATTENDANCE_QUEUE binding not found");
    }

    await queue.send({
      subdomain,
      data: {
        userId,
        type,
        method,
        timestamp: Date.now()
      }
    });

    return NextResponse.json({ success: true, message: "Attendance received and queued for processing" });
  } catch (err: any) {
    console.error("Attendance API Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
