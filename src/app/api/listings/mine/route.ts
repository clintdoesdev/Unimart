import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/server/auth";
import { serializeListing } from "@/lib/server/serialize";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const listings = await db.listing.findMany({
    where: { sellerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { category: true, seller: { include: { vendor: true } }, _count: { select: { savedBy: true } } },
  });

  return NextResponse.json({ listings: listings.map(serializeListing) });
}
