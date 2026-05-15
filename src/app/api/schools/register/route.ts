import { NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getGlobalDb } from '../../../../lib/db';
import { schools } from '../../../../db/schema/global';
import { nanoid } from 'nanoid';
import { eq, or } from 'drizzle-orm';

export const runtime = 'edge';

// Mock external NPSN validation function (could integrate with Data Kemdikbud API later)
const validateNPSN = async (npsn: string): Promise<boolean> => {
  // Simple mock: NPSN should be 8 digits
  return /^\d{8}$/.test(npsn);
};

export async function POST(request: Request) {
  try {
    const body = await request.json() as any;
    const { npsn, name, subdomain } = body;

    // 1. Basic Input Validation
    if (!npsn || !name || !subdomain) {
      return NextResponse.json({ success: false, error: "NPSN, name, and subdomain are required" }, { status: 400 });
    }

    if (!/^[a-z0-9]+$/.test(subdomain)) {
      return NextResponse.json({ success: false, error: "Subdomain must contain only lowercase letters and numbers" }, { status: 400 });
    }

    // 2. Validate NPSN format
    const isValidNpsn = await validateNPSN(npsn);
    if (!isValidNpsn) {
      return NextResponse.json({ success: false, error: "Invalid NPSN format (must be 8 digits)" }, { status: 400 });
    }

    const context = getRequestContext();
    const env = context.env as any;

    const globalDb = getGlobalDb(env);

    // 3. Check for duplicates (NPSN or Subdomain)
    const existingSchool = await globalDb.query.schools.findFirst({
      where: or(
        eq(schools.npsn, npsn),
        eq(schools.subdomain, subdomain)
      )
    });

    if (existingSchool) {
      if (existingSchool.npsn === npsn) {
         return NextResponse.json({ success: false, error: "A school with this NPSN is already registered" }, { status: 409 });
      }
      return NextResponse.json({ success: false, error: "Subdomain is already taken" }, { status: 409 });
    }

    // 4. In a real scenario, we would trigger an API call to Turso to create a new Database here.
    // For now, we'll simulate the creation and assign a placeholder DB URL.
    // Replace with actual Turso DB creation logic when implementing Phase 1.3 fully.
    
    // NOTE: This requires the Turso Platform API token to be configured in env.
    // const newDbName = `school-${subdomain}`;
    // await createTursoDatabase(newDbName, env.TURSO_PLATFORM_API_TOKEN); 
    
    const mockDbUrl = `libsql://mock-${subdomain}-db.turso.io`; 
    const mockDbToken = "mock-token-for-development";

    // 5. Insert into Global DB
    const newSchool = await globalDb.insert(schools).values({
      id: nanoid(),
      npsn,
      name: name.toUpperCase(), // Enforce uppercase rule
      subdomain,
      dbUrl: mockDbUrl,
      dbToken: mockDbToken,
      status: "PENDING", // Pending manual approval or email verification
    }).returning();

    return NextResponse.json({ 
      success: true, 
      message: "School registration submitted successfully",
      school: newSchool[0]
    });

  } catch (err: any) {
    console.error("Registration API Error:", err);
    return NextResponse.json({ success: false, error: "An internal server error occurred" }, { status: 500 });
  }
}
