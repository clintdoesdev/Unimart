import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { seedDemoData } from "@/lib/server/seed";

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function POST(request: Request) {
  const secret = process.env.SEED_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "SEED_SECRET is not configured." }, { status: 503 });
  }

  const provided = request.headers.get("x-seed-secret") ?? "";
  if (!safeEqual(provided, secret)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const existing = await db.listing.count();
  if (existing > 0) {
    return NextResponse.json(
      { error: "Demo data already exists — refusing to reseed.", listingCount: existing },
      { status: 409 }
    );
  }

  const log: string[] = [];
  await seedDemoData(db, (msg) => log.push(msg));

  return NextResponse.json({ ok: true, log });
}
