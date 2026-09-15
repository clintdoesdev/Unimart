import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/server/auth";

export async function POST(_request: Request, { params }: { params: Promise<{ listingId: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const { listingId } = await params;

  const existing = await db.savedListing.findUnique({
    where: { userId_listingId: { userId: user.id, listingId } },
  });

  if (existing) {
    await db.savedListing.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  }

  await db.savedListing.create({ data: { userId: user.id, listingId } });
  return NextResponse.json({ saved: true });
}
