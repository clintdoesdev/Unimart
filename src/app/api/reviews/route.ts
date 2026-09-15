import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const targetId = request.nextUrl.searchParams.get("targetId");
  if (!targetId) {
    return NextResponse.json({ error: "targetId is required." }, { status: 400 });
  }

  const reviews = await db.review.findMany({
    where: { targetId },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { fullName: true } } },
  });

  return NextResponse.json({
    reviews: reviews.map((r) => ({
      id: r.id,
      authorName: r.author.fullName,
      rating: r.rating,
      tags: r.tags,
      note: r.note,
      createdAt: r.createdAt,
    })),
  });
}
