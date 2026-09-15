import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const categories = await db.category.findMany({
    include: { _count: { select: { listings: { where: { status: "LIVE" } } } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    categories: categories.map((c) => ({
      id: c.slug,
      name: c.name,
      icon: c.icon,
      listingCount: c._count.listings,
    })),
  });
}
