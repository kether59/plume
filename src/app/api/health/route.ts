import { db } from "@/db";
import { sql } from "drizzle-orm";
import { databaseFailure } from "@/db/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true });
  } catch (error) {
    const databaseError = databaseFailure(error);
    console.error("GET /api/health error:", error);
    return Response.json(
      { ok: false, error: databaseError?.message || "La base de données est inaccessible." },
      { status: databaseError?.status || 500 },
    );
  }
}
