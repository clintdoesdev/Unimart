import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/server/auth";

const bodySchema = z.object({ amount: z.number().int().min(1).max(1_000_000) });

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
  }

  const [updated] = await db.$transaction([
    db.user.update({ where: { id: user.id }, data: { walletBalance: { increment: parsed.data.amount } } }),
    db.walletLedgerEntry.create({
      data: { userId: user.id, label: "Top up via UPI", amount: parsed.data.amount, type: "CREDIT" },
    }),
  ]);

  return NextResponse.json({ balance: updated.walletBalance });
}
