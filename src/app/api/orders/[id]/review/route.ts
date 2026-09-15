import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/server/auth";

const bodySchema = z.object({
  rating: z.number().int().min(1).max(5),
  tags: z.array(z.string()).max(10).default([]),
  note: z.string().trim().max(500).optional(),
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const { id } = await params;

  const order = await db.order.findUnique({ where: { id } });
  if (!order || order.buyerId !== user.id) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  if (order.status !== "COMPLETED") {
    return NextResponse.json({ error: "You can only review a completed order." }, { status: 400 });
  }
  if (order.reviewed) {
    return NextResponse.json({ error: "You already reviewed this order." }, { status: 409 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid review." }, { status: 400 });
  }

  await db.$transaction([
    db.review.create({
      data: {
        orderId: order.id,
        authorId: user.id,
        targetId: order.sellerId,
        rating: parsed.data.rating,
        tags: parsed.data.tags,
        note: parsed.data.note,
      },
    }),
    db.order.update({ where: { id: order.id }, data: { reviewed: true } }),
  ]);

  return NextResponse.json({ ok: true });
}
