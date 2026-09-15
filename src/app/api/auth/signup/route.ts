import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/server/auth";
import { issueOtp } from "@/lib/server/otp";
import { isUniversityEmail } from "@/lib/university-email";

const bodySchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email(),
  campus: z.string().trim().min(1),
  password: z.string().min(8).max(200),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid signup details." }, { status: 400 });
  }
  const { fullName, email, campus, password } = parsed.data;

  if (!isUniversityEmail(email)) {
    return NextResponse.json({ error: "Use your university email address (.edu / .ac.in)." }, { status: 400 });
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing?.emailVerifiedAt) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = existing
    ? await db.user.update({ where: { id: existing.id }, data: { fullName, campus, passwordHash } })
    : await db.user.create({ data: { fullName, email, campus, passwordHash, role: "STUDENT" } });

  await issueOtp(user.id, user.email);

  return NextResponse.json({ ok: true });
}
