import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/server/auth";

const bodySchema = z.object({ status: z.enum(["ACCEPTED", "DECLINED"]) });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const { id, messageId } = await params;

  const conversation = await db.conversation.findUnique({ where: { id } });
  if (!conversation || (conversation.buyerId !== user.id && conversation.sellerId !== user.id)) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  const message = await db.message.findUnique({ where: { id: messageId } });
  if (!message || message.conversationId !== id || !message.offerAmount) {
    return NextResponse.json({ error: "Offer not found." }, { status: 404 });
  }
  if (message.senderId === user.id) {
    return NextResponse.json({ error: "You can't respond to your own offer." }, { status: 400 });
  }
  if (message.offerStatus !== "PENDING") {
    return NextResponse.json({ error: "This offer was already resolved." }, { status: 409 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid response." }, { status: 400 });
  }

  const updated = await db.message.update({
    where: { id: messageId },
    data: { offerStatus: parsed.data.status },
  });

  return NextResponse.json({ offerStatus: updated.offerStatus });
}
