import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/server/auth";
import { serializeListing } from "@/lib/server/serialize";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const saved = await db.savedListing.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      listing: {
        include: { category: true, seller: { include: { vendor: true } }, _count: { select: { savedBy: true } } },
      },
    },
  });

  return NextResponse.json({
    listings: saved.map((s) => ({ ...serializeListing(s.listing), saved: true })),
  });
}
