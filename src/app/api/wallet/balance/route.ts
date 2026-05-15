import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getTenantDb } from '../../../../lib/db';
import { wallets } from '../../../../db/schema/tenant';
import { eq } from 'drizzle-orm';
import { jwtVerify } from 'jose';

export const runtime = 'edge';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_for_development_only'
);

export async function GET(request: Request) {
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

    if (payload.subdomain !== subdomain) {
       return NextResponse.json({ success: false, error: "Token does not match current school context" }, { status: 403 });
    }

    const userId = payload.sub as string;
    const context = getRequestContext();
    const env = context.env as any;

    // 2. Connect to Tenant DB to get Wallet ID
    const db = await getTenantDb(subdomain, env);
    const userWallet = await db.query.wallets.findFirst({
        where: eq(wallets.userId, userId)
    });

    if (!userWallet) {
        return NextResponse.json({ success: false, error: "Wallet not found for user" }, { status: 404 });
    }

    // 3. Query the Durable Object directly to get the absolute source of truth
    const DO_NAMESPACE = env.WALLET_DO;
    const id = DO_NAMESPACE.idFromName(userWallet.id);
    const stub = DO_NAMESPACE.get(id);

    const doResponse = await stub.fetch(`http://do/balance`);
    
    if (!doResponse.ok) {
         return NextResponse.json({ success: false, error: "Failed to fetch balance from DO" }, { status: doResponse.status });
    }

    const { balance } = await doResponse.json();

    return NextResponse.json({ 
        success: true, 
        balance
    });

  } catch (err: any) {
    console.error("Wallet Balance API Error:", err);
    return NextResponse.json({ success: false, error: "An internal server error occurred" }, { status: 500 });
  }
}
