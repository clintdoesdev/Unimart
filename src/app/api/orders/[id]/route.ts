import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/server/auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: { items: true, buyer: true, seller: true },
  });
  if (!order || (order.buyerId !== user.id && order.sellerId !== user.id)) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const role = order.buyerId === user.id ? "buying" : "selling";
  const timeline = [
    { label: "Paid", timestamp: order.createdAt, done: true },
    { label: "Dropped at locker", timestamp: order.droppedAt, done: !!order.droppedAt || order.status !== "PAID" },
    { label: "Collected by you", timestamp: order.collectedAt, done: !!order.collectedAt },
  ];

  return NextResponse.json({
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      role,
      counterpartName: role === "selling" ? order.buyer.fullName : order.seller.fullName,
      sellerId: order.sellerId,
      items: order.items.map((i) => ({ listingId: i.listingId, title: i.title, price: i.price, qty: i.qty })),
      subtotal: order.subtotal,
      handoverCost: order.handoverCost,
      discount: order.discount,
      total: order.total,
      handoverMethod: order.handoverMethod,
      status: order.status,
      pickupCode: order.pickupCode,
      reviewed: order.reviewed,
      createdAt: order.createdAt,
      timeline,
    },
  });
}
