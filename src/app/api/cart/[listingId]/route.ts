import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/server/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ listingId: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const { listingId } = await params;
  const parsed = z.object({ qty: z.number().int().min(1).max(20) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid quantity." }, { status: 400 });
  }

  await db.cartItem.updateMany({
    where: { userId: user.id, listingId },
    data: { qty: parsed.data.qty },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ listingId: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const { listingId } = await params;
  await db.cartItem.deleteMany({ where: { userId: user.id, listingId } });
  return NextResponse.json({ ok: true });
}
