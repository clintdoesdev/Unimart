import "server-only";
import { db } from "@/lib/db";
import { sendOtpEmail } from "@/lib/server/email";

const OTP_LENGTH = 5;
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
export const OTP_RESEND_THROTTLE_MS = 30 * 1000;

const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

function generateCode(): string {
  let code = "";
  for (let i = 0; i < OTP_LENGTH; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

export async function issueOtp(userId: string, email: string): Promise<{ throttledForMs?: number }> {
  const latest = await db.otpCode.findFirst({
    where: { userId, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (latest) {
    const elapsed = Date.now() - latest.createdAt.getTime();
    if (elapsed < OTP_RESEND_THROTTLE_MS) {
      return { throttledForMs: OTP_RESEND_THROTTLE_MS - elapsed };
    }
  }

  const code = generateCode();
  await db.otpCode.create({
    data: { userId, code, expiresAt: new Date(Date.now() + OTP_TTL_MS) },
  });
  await sendOtpEmail(email, code);
  return {};
}

export async function verifyOtp(userId: string, code: string): Promise<boolean> {
  const otp = await db.otpCode.findFirst({
    where: { userId, code: code.toUpperCase(), consumedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!otp || otp.expiresAt < new Date()) return false;

  await db.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });
  return true;
}
