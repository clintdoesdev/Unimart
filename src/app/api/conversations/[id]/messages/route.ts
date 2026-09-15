import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/server/auth";

const bodySchema = z
  .object({
    text: z.string().trim().min(1).max(2000).optional(),
    offerAmount: z.number().int().min(1).max(10_000_000).optional(),
  })
  .refine((v) => !!v.text !== !!v.offerAmount, { message: "Send either a message or an offer, not both." });

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const { id } = await params;

  const conversation = await db.conversation.findUnique({ where: { id } });
  if (!conversation || (conversation.buyerId !== user.id && conversation.sellerId !== user.id)) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message." }, { status: 400 });
  }

  const message = await db.message.create({
    data: {
      conversationId: id,
      senderId: user.id,
      text: parsed.data.text,
      offerAmount: parsed.data.offerAmount,
      offerStatus: parsed.data.offerAmount ? "PENDING" : undefined,
    },
  });
  await db.conversation.update({ where: { id }, data: { updatedAt: new Date() } });

  return NextResponse.json({
    message: {
      id: message.id,
      from: "me",
      text: message.text,
      offerAmount: message.offerAmount,
      offerStatus: message.offerStatus,
      createdAt: message.createdAt,
    },
  });
}
