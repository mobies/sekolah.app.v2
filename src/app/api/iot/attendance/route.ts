import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

/**
 * Validates the HMAC signature of the request.
 * The physical IoT device must hash the stringified body using the shared IOT_SECRET.
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

  // Convert hex signature from device to Uint8Array
  const signatureBytes = new Uint8Array(
    signature.match(/[\da-f]{2}/gi)?.map((h) => parseInt(h, 16)) || []
  );

  return await crypto.subtle.verify(
    'HMAC',
    key,
    signatureBytes,
    encoder.encode(body)
  );
}

export async function POST(request: Request) {
  try {
    // 1. Extract Headers
    const subdomain = request.headers.get('x-school-subdomain');
    const signature = request.headers.get('x-iot-signature');
    const timestamp = request.headers.get('x-iot-timestamp');

    if (!subdomain || !signature || !timestamp) {
      return NextResponse.json({ success: false, error: "Missing required IoT headers" }, { status: 400 });
    }

    // Prevent replay attacks (reject if request is older than 5 minutes)
    const requestTime = parseInt(timestamp, 10);
    const now = Date.now();
    if (Math.abs(now - requestTime) > 5 * 60 * 1000) {
        return NextResponse.json({ success: false, error: "Request expired" }, { status: 401 });
    }

    const context = getRequestContext();
    const env = context.env as any;

    // In a production system, you would look up a specific secret per school/device
    // from the database or KV. For now, we use a global env variable.
    const IOT_SECRET = env.IOT_SHARED_SECRET || 'development_iot_secret_key';

    // 2. Read and Verify Body
    const rawBody = await request.text();
    
    const isValid = await verifyHmac(rawBody, signature, IOT_SECRET);
    if (!isValid) {
        return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 403 });
    }

    // 3. Process the payload
    const payload = JSON.parse(rawBody);
    const { deviceId, scanData, type } = payload; // scanData is usually the RFID UID

    if (!scanData || !type) {
         return NextResponse.json({ success: false, error: "Invalid payload structure" }, { status: 400 });
    }

    // NOTE: Here you would normally do a quick lookup to map the RFID UID (`scanData`)
    // to an actual `userId` in the DB. To keep this endpoint extremely fast, 
    // we assume the IoT device sends the actual DB `userId`, or we push the UID 
    // to the queue and let the Consumer worker do the DB lookup and resolution.
    // We choose the latter for maximum edge performance.

    const queue = env.ATTENDANCE_QUEUE;
    if (!queue) {
      throw new Error("ATTENDANCE_QUEUE binding not found");
    }

    // Push to the same queue used by the manual API
    await queue.send({
      subdomain,
      data: {
        userId: scanData, // In practice, the consumer worker translates RFID -> User ID
        type: type, // "IN" or "OUT"
        method: "RFID",
        timestamp: requestTime
      }
    });

    return NextResponse.json({ success: true, message: "ACK" });

  } catch (err: any) {
    console.error("IoT Bridge Error:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
