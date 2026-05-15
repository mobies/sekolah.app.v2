import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getTenantDb } from '../../../../lib/db';
import { users, academicGrades } from '../../../../db/schema/tenant';
import { eq, and } from 'drizzle-orm';

export const runtime = 'edge';

/**
 * Validates the HMAC signature for server-to-server communication.
 */
async function verifyHmac(body: string, signature: string, secret: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );

  const signatureBytes = new Uint8Array(
    signature.match(/[\da-f]{2}/gi)?.map((h) => parseInt(h, 16)) || []
  );

  return await crypto.subtle.verify('HMAC', key, signatureBytes, encoder.encode(body));
}

export async function POST(request: Request) {
  try {
    const subdomain = request.headers.get('x-school-subdomain');
    const signature = request.headers.get('x-cbt-signature');
    const timestamp = request.headers.get('x-cbt-timestamp');

    if (!subdomain || !signature || !timestamp) {
      return NextResponse.json({ success: false, error: "Missing required headers" }, { status: 400 });
    }

    // Prevent replay attacks (5 minute window)
    const requestTime = parseInt(timestamp, 10);
    if (Math.abs(Date.now() - requestTime) > 5 * 60 * 1000) {
        return NextResponse.json({ success: false, error: "Request expired" }, { status: 401 });
    }

    const context = getRequestContext();
    const env = context.env as any;
    const CBT_SECRET = env.CBT_SHARED_SECRET || 'development_cbt_secret_key';

    const rawBody = await request.text();
    
    if (!(await verifyHmac(rawBody, signature, CBT_SECRET))) {
        return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 403 });
    }

    const payload = JSON.parse(rawBody);
    const { action, data } = payload;
    
    const db = await getTenantDb(subdomain, env);

    // Action 1: CBT System requesting a list of students to populate exam roster
    if (action === 'FETCH_STUDENTS') {
        const studentList = await db.select({
            id: users.id,
            name: users.name,
            email: users.email
        }).from(users).where(eq(users.role, 'STUDENT'));

        return NextResponse.json({ success: true, students: studentList });
    }

    // Action 2: CBT System pushing graded results back to SekolahApp
    if (action === 'PUSH_GRADES') {
        if (!Array.isArray(data)) {
             return NextResponse.json({ success: false, error: "Data must be an array of grades" }, { status: 400 });
        }

        const insertData = data.map((grade: any) => ({
            id: crypto.randomUUID(),
            userId: grade.userId,
            examId: grade.examId,
            subject: grade.subject,
            score: grade.score,
            maxScore: grade.maxScore || 100,
            syncedAt: new Date(requestTime)
        }));

        // In SQLite, doing batch inserts is efficient
        await db.insert(academicGrades).values(insertData);

        return NextResponse.json({ 
            success: true, 
            message: `Successfully synced ${insertData.length} grades` 
        });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });

  } catch (err: any) {
    console.error("CBT Sync API Error:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
