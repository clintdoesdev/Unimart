import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/server/auth";
import { serializeListing } from "@/lib/server/serialize";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await db.listing.findUnique({
    where: { id },
    include: { category: true, seller: { include: { vendor: true } }, _count: { select: { savedBy: true } } },
  });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }

  db.listing.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {});

  const user = await getCurrentUser();
  let saved = false;
  if (user) {
    saved = !!(await db.savedListing.findUnique({
      where: { userId_listingId: { userId: user.id, listingId: id } },
    }));
  }

  return NextResponse.json({ listing: { ...serializeListing(listing), saved } });
}

const patchSchema = z.object({
  status: z.enum(["LIVE", "DRAFT", "SOLD"]).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const { id } = await params;
  const listing = await db.listing.findUnique({ where: { id } });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }
  if (listing.sellerId !== user.id) {
    return NextResponse.json({ error: "You don't own this listing." }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  }

  const updated = await db.listing.update({
    where: { id },
    data: parsed.data,
    include: { category: true, seller: { include: { vendor: true } }, _count: { select: { savedBy: true } } },
  });

  return NextResponse.json({ listing: serializeListing(updated) });
}
