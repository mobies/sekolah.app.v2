import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getTenantDb } from '../../../../lib/db';
import { users } from '../../../../db/schema/tenant';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

export const runtime = 'edge';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_for_development_only'
);

export async function POST(request: Request) {
  try {
    const subdomain = request.headers.get('x-school-subdomain');
    
    if (!subdomain) {
      return NextResponse.json({ success: false, error: "Subdomain context missing. Are you accessing via a school URL?" }, { status: 400 });
    }

    const body = await request.json() as any;
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 });
    }

    const context = getRequestContext();
    const env = context.env as any;

    // Connect to the specific school's database
    let db;
    try {
      db = await getTenantDb(subdomain, env);
    } catch (dbError) {
      return NextResponse.json({ success: false, error: `Could not connect to school database for ${subdomain}` }, { status: 404 });
    }

    // Find User
    const user = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    // Verify Password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
       // Using generic error to prevent email enumeration
       return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    // Create JWT
    const alg = 'HS256';
    const token = await new SignJWT({ 
        sub: user.id,
        role: user.role,
        subdomain: subdomain 
      })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    // Set HTTP-only Cookie
    const response = NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      } 
    });

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;

  } catch (err: any) {
    console.error("Login API Error:", err);
    return NextResponse.json({ success: false, error: "An internal server error occurred" }, { status: 500 });
  }
}
