import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id },
    include: { vendor: true, reviewsReceived: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const salesCount = await db.order.count({ where: { sellerId: id, status: "COMPLETED" } });
  const rating = user.reviewsReceived.length
    ? user.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / user.reviewsReceived.length
    : 5;

  return NextResponse.json({
    seller: {
      id: user.id,
      name: user.fullName,
      course: user.course,
      year: user.year,
      campus: user.campus,
      rating: Math.round(rating * 10) / 10,
      salesCount,
      reviewCount: user.reviewsReceived.length,
      verified: !!user.emailVerifiedAt,
      isVendor: user.role === "VENDOR",
      vendor:
        user.vendor && user.vendor.status === "APPROVED"
          ? {
              businessName: user.vendor.businessName,
              category: user.vendor.category,
              description: user.vendor.description,
            }
          : null,
    },
  });
}
