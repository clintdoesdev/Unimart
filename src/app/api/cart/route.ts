import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/server/auth";
import { serializeSeller } from "@/lib/server/serialize";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const items = await db.cartItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    include: { listing: { include: { seller: { include: { vendor: true } } } } },
  });

  const groups = new Map<
    string,
    { seller: ReturnType<typeof serializeSeller>; lines: { listingId: string; title: string; price: number; qty: number }[] }
  >();
  for (const item of items) {
    const sellerId = item.listing.sellerId;
    if (!groups.has(sellerId)) {
      groups.set(sellerId, { seller: serializeSeller(item.listing.seller), lines: [] });
    }
    groups.get(sellerId)!.lines.push({
      listingId: item.listingId,
      title: item.listing.title,
      price: item.listing.price,
      qty: item.qty,
    });
  }

  return NextResponse.json({ groups: Array.from(groups.entries()).map(([sellerId, g]) => ({ sellerId, ...g })) });
}

const addSchema = z.object({ listingId: z.string().min(1) });

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const parsed = addSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const listing = await db.listing.findUnique({ where: { id: parsed.data.listingId } });
  if (!listing || listing.status !== "LIVE") {
    return NextResponse.json({ error: "This listing is no longer available." }, { status: 404 });
  }
  if (listing.sellerId === user.id) {
    return NextResponse.json({ error: "You can't buy your own listing." }, { status: 400 });
  }

  const existing = await db.cartItem.findUnique({
    where: { userId_listingId: { userId: user.id, listingId: listing.id } },
  });
  if (existing) {
    await db.cartItem.update({ where: { id: existing.id }, data: { qty: { increment: 1 } } });
  } else {
    await db.cartItem.create({ data: { userId: user.id, listingId: listing.id, qty: 1 } });
  }

  return NextResponse.json({ ok: true });
}
