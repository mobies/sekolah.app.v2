import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getTenantDb } from '../../../../lib/db';
import { attendance, users } from '../../../../db/schema/tenant';
import { desc, eq, gte } from 'drizzle-orm';
import { jwtVerify } from 'jose';

export const runtime = 'edge';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_for_development_only'
);

export async function GET(request: Request) {
  const subdomain = request.headers.get('x-school-subdomain');
  
  if (!subdomain) {
    return new Response("Subdomain context missing", { status: 400 });
  }

  // 1. Authenticate Request
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/(?:^|;\s*)auth_token=([^;]*)/);
  const token = match ? match[1] : null;

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    const payload = verified.payload;

    if (payload.subdomain !== subdomain || payload.role !== 'ADMIN') {
        return new Response("Forbidden: Admin access required", { status: 403 });
    }
  } catch (err) {
    return new Response("Invalid token", { status: 401 });
  }

  const context = getRequestContext();
  const env = context.env as any;

  // Set up Server-Sent Events (SSE) headers
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const db = await getTenantDb(subdomain, env);
        
        // Push initial state (last 20 records for today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const initialLogs = await db
            .select({
                id: attendance.id,
                type: attendance.type,
                method: attendance.method,
                timestamp: attendance.timestamp,
                userName: users.name,
                userRole: users.role,
            })
            .from(attendance)
            .innerJoin(users, eq(attendance.userId, users.id))
            .where(gte(attendance.timestamp, today))
            .orderBy(desc(attendance.timestamp))
            .limit(20);

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'INITIAL', data: initialLogs })}\n\n`));

        // Note: In a true Edge/Cloudflare environment, long-lived connections (SSE)
        // have time limits. For a robust production system, you would integrate this 
        // with Cloudflare Durable Objects + WebSockets, or use an external service like Pusher.
        // For this implementation, we will simulate a polling mechanism within the stream
        // that pushes new records every few seconds to demonstrate the flow.

        let lastTimestamp: Date = initialLogs.length > 0 && initialLogs[0].timestamp ? initialLogs[0].timestamp : today;

        const interval = setInterval(async () => {
            try {
                const newLogs = await db
                    .select({
                        id: attendance.id,
                        type: attendance.type,
                        method: attendance.method,
                        timestamp: attendance.timestamp,
                        userName: users.name,
                        userRole: users.role,
                    })
                    .from(attendance)
                    .innerJoin(users, eq(attendance.userId, users.id))
                    .where(gte(attendance.timestamp, lastTimestamp as any)) // Cast to any to bypass strict null check
                    .orderBy(desc(attendance.timestamp));

                // Filter out records strictly greater than the last seen to avoid duplicates
                const updates = newLogs.filter(log => log.timestamp && lastTimestamp && log.timestamp.getTime() > lastTimestamp.getTime());

                if (updates.length > 0 && updates[0].timestamp) {
                    lastTimestamp = updates[0].timestamp;
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'UPDATE', data: updates })}\n\n`));
                }
                
                // Keep connection alive
                controller.enqueue(encoder.encode(`: keepalive\n\n`));

            } catch (pollError) {
                console.error("Polling error in stream:", pollError);
            }
        }, 5000); // Check every 5 seconds

        // Clean up on disconnect
        request.signal.addEventListener("abort", () => {
            clearInterval(interval);
            controller.close();
        });

      } catch (err: any) {
        console.error("Stream Setup Error:", err);
        controller.error(err);
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
