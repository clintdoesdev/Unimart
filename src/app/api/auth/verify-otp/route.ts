import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, publicUser } from "@/lib/server/auth";
import { verifyOtp } from "@/lib/server/otp";

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  code: z.string().trim().min(1).max(10),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { email, code } = parsed.data;

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "No signup found for this email." }, { status: 404 });
  }

  const ok = await verifyOtp(user.id, code);
  if (!ok) {
    return NextResponse.json({ error: "That code is invalid or has expired." }, { status: 400 });
  }

  const verifiedUser = await db.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } });
  await createSession(verifiedUser.id);

  return NextResponse.json({ user: publicUser(verifiedUser) });
}
