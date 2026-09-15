import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/server/auth";
import { serializeListing } from "@/lib/server/serialize";
import type { Prisma, Condition, HandoverMethod } from "@/generated/prisma/client";

const querySchema = z.object({
  q: z.string().trim().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  condition: z.array(z.string()).optional(),
  handover: z.array(z.string()).optional(),
  free: z.coerce.boolean().optional(),
  sort: z.enum(["newest", "price-asc", "price-desc", "nearby", "for-you"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
  sellerId: z.string().optional(),
  department: z.string().optional(),
  excludeId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const parsed = querySchema.safeParse({
    q: params.get("q") ?? undefined,
    category: params.get("category") ?? undefined,
    minPrice: params.get("minPrice") ?? undefined,
    maxPrice: params.get("maxPrice") ?? undefined,
    condition: params.getAll("condition").length ? params.getAll("condition") : undefined,
    handover: params.getAll("handover").length ? params.getAll("handover") : undefined,
    free: params.get("free") ?? undefined,
    sort: params.get("sort") ?? undefined,
    page: params.get("page") ?? undefined,
    pageSize: params.get("pageSize") ?? undefined,
    sellerId: params.get("sellerId") ?? undefined,
    department: params.get("department") ?? undefined,
    excludeId: params.get("excludeId") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query." }, { status: 400 });
  }
  const q = parsed.data;
  const user = await getCurrentUser();

  const where: Prisma.ListingWhereInput = { status: "LIVE" };
  if (q.q) where.title = { contains: q.q, mode: "insensitive" };
  if (q.category) where.category = { slug: q.category };
  if (q.department) where.department = q.department;
  if (q.sellerId) where.sellerId = q.sellerId;
  if (q.excludeId) where.id = { not: q.excludeId };
  if (q.free) where.price = 0;
  if (q.minPrice !== undefined || q.maxPrice !== undefined) {
    where.price = { gte: q.minPrice ?? 0, lte: q.maxPrice ?? undefined };
  }
  if (q.condition?.length) where.condition = { in: q.condition as Condition[] };
  if (q.handover?.length) where.handover = { hasSome: q.handover as HandoverMethod[] };

  const orderBy: Prisma.ListingOrderByWithRelationInput =
    q.sort === "price-asc"
      ? { price: "asc" }
      : q.sort === "price-desc"
        ? { price: "desc" }
        : q.sort === "nearby"
          ? { distanceMeters: "asc" }
          : { createdAt: "desc" };

  const [listings, total] = await Promise.all([
    db.listing.findMany({
      where,
      orderBy,
      skip: (q.page - 1) * q.pageSize,
      take: q.pageSize,
      include: {
        category: true,
        seller: { include: { vendor: true } },
        _count: { select: { savedBy: true } },
      },
    }),
    db.listing.count({ where }),
  ]);

  let savedIds = new Set<string>();
  if (user) {
    const saved = await db.savedListing.findMany({
      where: { userId: user.id, listingId: { in: listings.map((l) => l.id) } },
      select: { listingId: true },
    });
    savedIds = new Set(saved.map((s) => s.listingId));
  }

  return NextResponse.json({
    listings: listings.map((l) => ({ ...serializeListing(l), saved: savedIds.has(l.id) })),
    total,
    page: q.page,
    pageSize: q.pageSize,
  });
}

const createSchema = z.object({
  title: z.string().trim().min(2).max(150),
  price: z.number().int().min(0).max(10_000_000),
  category: z.string().min(1),
  department: z.string().trim().min(1).max(80),
  condition: z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR"]),
  description: z.string().trim().min(1).max(2000),
  handover: z.array(z.enum(["LOCKER", "MEET", "DELIVER"])).min(1),
  photoCount: z.number().int().min(0).max(10).default(1),
  status: z.enum(["LIVE", "DRAFT"]).default("LIVE"),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the listing details and try again." }, { status: 400 });
  }
  const data = parsed.data;

  if (data.status === "LIVE" && user.role === "VENDOR") {
    const vendor = await db.vendor.findUnique({ where: { ownerId: user.id } });
    if (!vendor || vendor.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Your vendor application is still pending approval — you can save this as a draft for now." },
        { status: 403 }
      );
    }
  }

  const category = await db.category.findUnique({ where: { slug: data.category } });
  if (!category) {
    return NextResponse.json({ error: "Unknown category." }, { status: 400 });
  }

  const listing = await db.listing.create({
    data: {
      title: data.title,
      price: data.price,
      categoryId: category.id,
      department: data.department,
      condition: data.condition,
      description: data.description,
      handover: data.handover,
      photoCount: data.photoCount,
      status: data.status,
      location: user.campus,
      sellerId: user.id,
    },
    include: { category: true, seller: { include: { vendor: true } } },
  });

  return NextResponse.json({ listing: serializeListing(listing) }, { status: 201 });
}
