import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/server/auth";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const status = request.nextUrl.searchParams.get("status");
  const vendors = await db.vendor.findMany({
    where: status ? { status: status as "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED" } : undefined,
    include: { owner: { select: { email: true, fullName: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ vendors });
}
