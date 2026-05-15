import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { jwtVerify } from 'jose';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    let payload;
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      payload = verified.payload;
    } catch (err) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }

    // Only Teachers and Admins can upload materials
    if (payload.subdomain !== subdomain || (payload.role !== 'TEACHER' && payload.role !== 'ADMIN')) {
       return NextResponse.json({ success: false, error: "Forbidden: Teacher access required" }, { status: 403 });
    }

    const body = await request.json() as any;
    const { filename, contentType } = body;

    if (!filename || !contentType) {
      return NextResponse.json({ success: false, error: "Filename and contentType are required" }, { status: 400 });
    }

    const context = getRequestContext();
    const env = context.env as any;

    // We use the AWS SDK S3Client to generate presigned URLs for Cloudflare R2
    const S3 = new S3Client({
      region: "auto",
      endpoint: `https://${env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });

    // Isolate files by subdomain to prevent cross-tenant access
    const fileKey = `${subdomain}/materials/${crypto.randomUUID()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    const command = new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME || 'school-assets-bucket', // Should match wrangler.toml binding or env
        Key: fileKey,
        ContentType: contentType,
    });

    // Generate a presigned URL that expires in 15 minutes
    const signedUrl = await getSignedUrl(S3, command, { expiresIn: 900 });

    return NextResponse.json({ 
        success: true, 
        uploadUrl: signedUrl,
        fileKey: fileKey
    });

  } catch (err: any) {
    console.error("Presigned URL Generation Error:", err);
    return NextResponse.json({ success: false, error: "Failed to generate upload URL" }, { status: 500 });
  }
}
