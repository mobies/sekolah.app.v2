import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getTenantDb } from '../../../../lib/db';
import { materials } from '../../../../db/schema/tenant';
import { eq, desc } from 'drizzle-orm';
import { jwtVerify } from 'jose';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const runtime = 'edge';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_for_development_only'
);

// Retrieve materials list
export async function GET(request: Request) {
  try {
    const subdomain = request.headers.get('x-school-subdomain');
    if (!subdomain) return NextResponse.json({ error: "Subdomain missing" }, { status: 400 });

    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/(?:^|;\s*)auth_token=([^;]*)/);
    const token = match ? match[1] : null;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let payload;
    try {
      payload = (await jwtVerify(token, JWT_SECRET)).payload;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (payload.subdomain !== subdomain) {
       return NextResponse.json({ error: "Context mismatch" }, { status: 403 });
    }

    const context = getRequestContext();
    const env = context.env as any;
    const db = await getTenantDb(subdomain, env);

    // In a real app, you would filter by classId based on the student's enrollment
    const url = new URL(request.url);
    const classId = url.searchParams.get('classId');

    let query = db.select().from(materials).orderBy(desc(materials.createdAt));
    if (classId) {
        // query = query.where(eq(materials.classId, classId)); // Type issue workaround below
        const results = await db.query.materials.findMany({
             where: eq(materials.classId, classId),
             orderBy: [desc(materials.createdAt)]
        });
        return NextResponse.json({ success: true, materials: results });
    }

    const allMaterials = await db.query.materials.findMany({
        orderBy: [desc(materials.createdAt)]
    });

    return NextResponse.json({ success: true, materials: allMaterials });

  } catch (err: any) {
    console.error("Fetch Materials Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Save material metadata after successful upload
export async function POST(request: Request) {
  try {
    const subdomain = request.headers.get('x-school-subdomain');
    if (!subdomain) return NextResponse.json({ error: "Subdomain missing" }, { status: 400 });

    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/(?:^|;\s*)auth_token=([^;]*)/);
    const token = match ? match[1] : null;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let payload;
    try {
      payload = (await jwtVerify(token, JWT_SECRET)).payload;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    if (payload.subdomain !== subdomain || (payload.role !== 'TEACHER' && payload.role !== 'ADMIN')) {
       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json() as any;
    const { title, description, classId, fileKey, fileType, fileSize } = body;

    const context = getRequestContext();
    const env = context.env as any;
    const db = await getTenantDb(subdomain, env);

    const newMaterial = await db.insert(materials).values({
        id: crypto.randomUUID(),
        title,
        description,
        classId,
        teacherId: payload.sub as string,
        fileKey,
        fileType,
        fileSize
    }).returning();

    return NextResponse.json({ success: true, material: newMaterial[0] });

  } catch (err: any) {
    console.error("Save Material Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
