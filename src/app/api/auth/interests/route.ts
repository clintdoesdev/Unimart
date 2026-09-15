import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser, publicUser } from "@/lib/server/auth";

const bodySchema = z.object({ interests: z.array(z.string()).max(20) });

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const updated = await db.user.update({
    where: { id: user.id },
    data: { interests: parsed.data.interests },
  });
  return NextResponse.json({ user: publicUser(updated) });
}
