import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/server/auth";
import { HANDOVER_COST, PROMO_CODE, PROMO_DISCOUNT, randomOrderNumber, randomPickupCode } from "@/lib/server/codes";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const role = request.nextUrl.searchParams.get("role") === "selling" ? "selling" : "buying";

  const orders = await db.order.findMany({
    where: role === "selling" ? { sellerId: user.id } : { buyerId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true, buyer: true, seller: true },
  });

  return NextResponse.json({
    orders: orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      role,
      counterpartName: role === "selling" ? o.buyer.fullName : o.seller.fullName,
      items: o.items.map((i) => ({ listingId: i.listingId, title: i.title, price: i.price, qty: i.qty })),
      subtotal: o.subtotal,
      handoverCost: o.handoverCost,
      discount: o.discount,
      total: o.total,
      handoverMethod: o.handoverMethod,
      status: o.status,
      pickupCode: o.pickupCode,
      reviewed: o.reviewed,
      createdAt: o.createdAt,
      droppedAt: o.droppedAt,
      collectedAt: o.collectedAt,
    })),
  });
}

const checkoutSchema = z.object({
  handoverBySeller: z.record(z.string(), z.enum(["LOCKER", "MEET", "DELIVER"])),
  promoCode: z.string().optional(),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
  }

  const cartItems = await db.cartItem.findMany({
    where: { userId: user.id },
    include: { listing: true },
  });
  if (cartItems.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  const bySeller = new Map<string, typeof cartItems>();
  for (const item of cartItems) {
    const list = bySeller.get(item.listing.sellerId) ?? [];
    list.push(item);
    bySeller.set(item.listing.sellerId, list);
  }

  const discountEligible = parsed.data.promoCode?.trim().toUpperCase() === PROMO_CODE;
  const createdOrders = [];
  let firstGroup = true;

  for (const [sellerId, items] of bySeller) {
    const handoverMethod = parsed.data.handoverBySeller[sellerId] ?? "LOCKER";
    const subtotal = items.reduce((sum, i) => sum + i.listing.price * i.qty, 0);
    const handoverCost = HANDOVER_COST[handoverMethod];
    const discount = firstGroup && discountEligible ? PROMO_DISCOUNT : 0;
    const total = Math.max(0, subtotal + handoverCost - discount);
    firstGroup = false;

    const order = await db.order.create({
      data: {
        orderNumber: randomOrderNumber(),
        buyerId: user.id,
        sellerId,
        subtotal,
        handoverCost,
        discount,
        total,
        handoverMethod,
        pickupCode: randomPickupCode(),
        items: {
          create: items.map((i) => ({
            listingId: i.listingId,
            title: i.listing.title,
            price: i.listing.price,
            qty: i.qty,
          })),
        },
      },
    });
    createdOrders.push(order);
  }

  await db.cartItem.deleteMany({ where: { userId: user.id } });

  return NextResponse.json({ orders: createdOrders.map((o) => ({ id: o.id, orderNumber: o.orderNumber })) });
}
