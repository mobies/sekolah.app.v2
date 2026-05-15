import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { jwtVerify } from 'jose';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getTenantDb } from '../../../../lib/db';
import { materials } from '../../../../db/schema/tenant';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_for_development_only'
);

export async function POST(request: Request) {
  try {
    const subdomain = request.headers.get('x-school-subdomain');
    
    if (!subdomain) {
      return NextResponse.json({ success: false, error: "Subdomain context missing" }, { status: 400 });
    }

    // 1. Authenticate Request
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/(?:^|;\s*)auth_token=([^;]*)/);
    const token = match ? match[1] : null;

    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    let payload;
    try {
      payload = (await jwtVerify(token, JWT_SECRET)).payload;
    } catch {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }

    if (payload.subdomain !== subdomain) {
       return NextResponse.json({ success: false, error: "Context mismatch" }, { status: 403 });
    }

    const body = await request.json() as any;
    const { materialId } = body;
    if (!materialId) return NextResponse.json({ success: false, error: "Material ID is required" }, { status: 400 });

    const context = getRequestContext();
    const env = context.env as any;
    const db = await getTenantDb(subdomain, env);

    // 2. Verify material exists and belongs to this school
    const material = await db.query.materials.findFirst({
        where: eq(materials.id, materialId)
    });

    if (!material) {
        return NextResponse.json({ success: false, error: "Material not found" }, { status: 404 });
    }

    // 3. Generate Presigned Download URL
    const S3 = new S3Client({
      region: "auto",
      endpoint: `https://${env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });

    const command = new GetObjectCommand({
        Bucket: env.R2_BUCKET_NAME || 'school-assets-bucket',
        Key: material.fileKey,
        ResponseContentDisposition: `attachment; filename="${material.title}"`,
    });

    // URL valid for 1 hour
    const signedUrl = await getSignedUrl(S3, command, { expiresIn: 3600 });

    return NextResponse.json({ 
        success: true, 
        downloadUrl: signedUrl 
    });

  } catch (err: any) {
    console.error("Presigned Download URL Error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
