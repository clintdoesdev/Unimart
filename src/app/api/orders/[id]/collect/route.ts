import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/server/auth";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const { id } = await params;

  const order = await db.order.findUnique({ where: { id } });
  if (!order || order.buyerId !== user.id) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  if (order.status === "COMPLETED") {
    return NextResponse.json({ error: "Already collected." }, { status: 409 });
  }

  const now = new Date();
  const [updated] = await db.$transaction([
    db.order.update({
      where: { id },
      data: { status: "COMPLETED", droppedAt: order.droppedAt ?? now, collectedAt: now },
    }),
    db.user.update({ where: { id: order.sellerId }, data: { walletBalance: { increment: order.total } } }),
    db.walletLedgerEntry.create({
      data: {
        userId: order.sellerId,
        label: `Payout — order ${order.orderNumber}`,
        amount: order.total,
        type: "CREDIT",
      },
    }),
    db.notification.create({
      data: {
        userId: order.sellerId,
        message: `Order ${order.orderNumber} was collected — ₹${order.total} credited to your wallet`,
      },
    }),
  ]);

  return NextResponse.json({ order: { id: updated.id, status: updated.status } });
}
