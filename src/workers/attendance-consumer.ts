import { getTenantDb } from "../lib/db";
import { attendance as attendanceTable } from "../db/schema/tenant";

interface AttendanceMessage {
  subdomain: string;
  data: {
    userId: string;
    type: "IN" | "OUT";
    method: "RFID" | "QR" | "MANUAL";
    timestamp: number;
  };
}

export default {
  async queue(batch: MessageBatch<AttendanceMessage>, env: any): Promise<void> {
    const messages = batch.messages;
    
    // Group messages by school (subdomain) to batch writes per tenant
    const grouped = messages.reduce((acc, msg) => {
      const { subdomain, data } = msg.body;
      if (!acc[subdomain]) acc[subdomain] = [];
      acc[subdomain].push(data);
      return acc;
    }, {} as Record<string, any[]>);

    for (const [subdomain, records] of Object.entries(grouped)) {
      try {
        const db = await getTenantDb(subdomain, env);
        await db.insert(attendanceTable).values(records.map(r => ({
          id: crypto.randomUUID(),
          userId: r.userId,
          type: r.type,
          method: r.method,
          timestamp: new Date(r.timestamp),
        })));
        console.log(`Successfully batched ${records.length} attendance records for ${subdomain}`);
      } catch (err) {
        console.error(`Failed to batch write for school ${subdomain}:`, err);
      }
    }
  }
};
