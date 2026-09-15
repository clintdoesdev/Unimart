import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser, publicUser } from "@/lib/server/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }

  const vendor = await db.vendor.findUnique({ where: { ownerId: user.id } });
  return NextResponse.json({ user: publicUser(user), vendor });
}
