import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || "Uni Mart <onboarding@resend.dev>";

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendOtpEmail(to: string, code: string): Promise<void> {
  if (!resend) {
    console.log(`[dev email fallback] OTP for ${to}: ${code}`);
    return;
  }

  const { error } = await resend.emails.send({
    from: fromEmail,
    to,
    subject: `${code} is your Uni Mart verification code`,
    html: `<p>Your Uni Mart verification code is:</p><p style="font-size:28px;font-weight:600;letter-spacing:0.2em">${code}</p><p>This code expires in 10 minutes.</p>`,
  });

  if (error) {
    console.error("Failed to send OTP email, falling back to console log:", error);
    console.log(`[dev email fallback] OTP for ${to}: ${code}`);
  }
}
