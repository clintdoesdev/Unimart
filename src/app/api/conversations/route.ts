import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/server/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const conversations = await db.conversation.findMany({
    where: { OR: [{ buyerId: user.id }, { sellerId: user.id }] },
    orderBy: { updatedAt: "desc" },
    include: {
      listing: { select: { id: true, title: true, price: true } },
      buyer: { select: { id: true, fullName: true } },
      seller: { select: { id: true, fullName: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const results = await Promise.all(
    conversations.map(async (c) => {
      const isBuyer = c.buyerId === user.id;
      const lastReadAt = isBuyer ? c.buyerLastReadAt : c.sellerLastReadAt;
      const unreadCount = await db.message.count({
        where: {
          conversationId: c.id,
          senderId: { not: user.id },
          createdAt: lastReadAt ? { gt: lastReadAt } : undefined,
        },
      });
      const counterpart = isBuyer ? c.seller : c.buyer;
      const lastMessage = c.messages[0];
      return {
        id: c.id,
        listingId: c.listingId,
        listingTitle: c.listing.title,
        listingPrice: c.listing.price,
        counterpartId: counterpart.id,
        counterpartName: counterpart.fullName,
        lastMessagePreview: lastMessage ? lastMessage.text ?? `Offer: ₹${lastMessage.offerAmount}` : "",
        updatedAt: c.updatedAt,
        unreadCount,
      };
    })
  );

  return NextResponse.json({ conversations: results });
}

const startSchema = z.object({ listingId: z.string().min(1) });

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const parsed = startSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const listing = await db.listing.findUnique({ where: { id: parsed.data.listingId } });
  if (!listing) {
    return NextResponse.json({ error: "Listing not found." }, { status: 404 });
  }
  if (listing.sellerId === user.id) {
    return NextResponse.json({ error: "You can't message yourself." }, { status: 400 });
  }

  const conversation = await db.conversation.upsert({
    where: { listingId_buyerId: { listingId: listing.id, buyerId: user.id } },
    update: {},
    create: { listingId: listing.id, buyerId: user.id, sellerId: listing.sellerId },
  });

  return NextResponse.json({ conversationId: conversation.id });
}
