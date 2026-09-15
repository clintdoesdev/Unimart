import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/server/auth";

const bodySchema = z.object({
  businessName: z.string().trim().min(2).max(120),
  category: z.string().trim().min(2).max(80),
  description: z.string().trim().min(10).max(1000),
  campus: z.string().trim().min(1),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  if (!user.emailVerifiedAt) {
    return NextResponse.json({ error: "Verify your email before applying as a vendor." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Fill in all vendor details." }, { status: 400 });
  }

  const existing = await db.vendor.findUnique({ where: { ownerId: user.id } });
  if (existing && existing.status !== "REJECTED") {
    return NextResponse.json({ error: "You already have a vendor application." }, { status: 409 });
  }

  const vendor = await db.vendor.upsert({
    where: { ownerId: user.id },
    update: { ...parsed.data, status: "PENDING", approvedAt: null },
    create: { ...parsed.data, ownerId: user.id, status: "PENDING" },
  });
  await db.user.update({ where: { id: user.id }, data: { role: "VENDOR" } });

  return NextResponse.json({ vendor });
}
