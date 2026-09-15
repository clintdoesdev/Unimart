import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { issueOtp } from "@/lib/server/otp";

const bodySchema = z.object({ email: z.string().trim().toLowerCase().email() });

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    return NextResponse.json({ error: "No signup found for this email." }, { status: 404 });
  }

  const result = await issueOtp(user.id, user.email);
  if (result.throttledForMs) {
    return NextResponse.json(
      { error: "Please wait before requesting another code.", retryInMs: result.throttledForMs },
      { status: 429 }
    );
  }

  return NextResponse.json({ ok: true });
}
