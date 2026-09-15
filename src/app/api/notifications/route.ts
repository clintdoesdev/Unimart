import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/server/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const items = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  return NextResponse.json({
    items: items.map((n) => ({
      id: n.id,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt,
      group: n.createdAt >= startOfToday ? "today" : "earlier",
    })),
  });
}
