import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getTenantDb } from '../../../../lib/db';
import { walletTransactions, wallets } from '../../../../db/schema/tenant';
import { eq } from 'drizzle-orm';
import { jwtVerify } from 'jose';

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

    if (payload.subdomain !== subdomain) {
       return NextResponse.json({ success: false, error: "Token does not match current school context" }, { status: 403 });
    }

    const userId = payload.sub as string;
    const body = await request.json() as any;
    const { amount, type, description, metadata } = body;

    if (!amount || amount <= 0 || !type || !['TOPUP', 'PURCHASE'].includes(type)) {
      return NextResponse.json({ success: false, error: "Invalid transaction parameters" }, { status: 400 });
    }

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

    // 3. Interact with Durable Object for Atomic Balance Update
    const DO_NAMESPACE = env.WALLET_DO;
    // We use the wallet ID as the unique identifier for the Durable Object instance
    const id = DO_NAMESPACE.idFromName(userWallet.id);
    const stub = DO_NAMESPACE.get(id);

    // Call the Durable Object
    const doResponse = await stub.fetch(`http://do/transaction`, {
        method: "POST",
        body: JSON.stringify({ amount, type, description }),
        headers: { "Content-Type": "application/json" }
    });

    if (!doResponse.ok) {
        const errorData = await doResponse.json();
        return NextResponse.json({ success: false, error: errorData.error || "Transaction failed at DO" }, { status: doResponse.status });
    }

    const { newBalance } = await doResponse.json();

    // 4. Record Transaction History in Tenant SQLite Database
    // This is done after the DO successfully processes it to maintain consistency.
    try {
        await db.insert(walletTransactions).values({
            id: crypto.randomUUID(),
            walletId: userWallet.id,
            amount,
            type,
            description,
            metadata: metadata || null
        });

        // Update the cached balance in SQLite (DO is the source of truth, but this helps read queries)
        await db.update(wallets)
            .set({ balance: newBalance, updatedAt: new Date() })
            .where(eq(wallets.id, userWallet.id));

    } catch (dbErr) {
        // Critical: The DO updated, but SQLite failed. In a production system, 
        // this needs a dead-letter queue or retry mechanism to ensure eventual consistency.
        console.error("Failed to sync transaction to SQLite after successful DO update:", dbErr);
        // We still return success to the user because their actual balance (in DO) is updated.
    }

    return NextResponse.json({ 
        success: true, 
        message: "Transaction successful",
        newBalance
    });

  } catch (err: any) {
    console.error("Wallet Transaction API Error:", err);
    return NextResponse.json({ success: false, error: "An internal server error occurred" }, { status: 500 });
  }
}
