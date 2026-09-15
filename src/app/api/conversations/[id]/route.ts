import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/server/auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const { id } = await params;

  const conversation = await db.conversation.findUnique({
    where: { id },
    include: {
      listing: { select: { id: true, title: true, price: true } },
      buyer: { select: { id: true, fullName: true } },
      seller: { select: { id: true, fullName: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!conversation || (conversation.buyerId !== user.id && conversation.sellerId !== user.id)) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  const isBuyer = conversation.buyerId === user.id;
  const counterpart = isBuyer ? conversation.seller : conversation.buyer;

  await db.conversation.update({
    where: { id },
    data: isBuyer ? { buyerLastReadAt: new Date() } : { sellerLastReadAt: new Date() },
  });

  return NextResponse.json({
    conversation: {
      id: conversation.id,
      listingId: conversation.listing.id,
      listingTitle: conversation.listing.title,
      listingPrice: conversation.listing.price,
      counterpartId: counterpart.id,
      counterpartName: counterpart.fullName,
      messages: conversation.messages.map((m) => ({
        id: m.id,
        from: m.senderId === user.id ? "me" : "them",
        text: m.text,
        offerAmount: m.offerAmount,
        offerStatus: m.offerStatus,
        createdAt: m.createdAt,
      })),
    },
  });
}
