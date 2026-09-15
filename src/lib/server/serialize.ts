import "server-only";
import type { Listing, User, Vendor, Category } from "@/generated/prisma/client";

export type ListingWithRelations = Listing & {
  category: Category;
  seller: User & { vendor: Vendor | null };
  _count?: { savedBy: number };
};

export function serializeSeller(user: User & { vendor: Vendor | null }) {
  return {
    id: user.id,
    name: user.fullName,
    course: user.course,
    year: user.year,
    campus: user.campus,
    isVendor: user.role === "VENDOR",
    vendor:
      user.vendor && user.vendor.status === "APPROVED"
        ? { businessName: user.vendor.businessName, category: user.vendor.category, verified: true }
        : null,
  };
}

export function serializeListing(listing: ListingWithRelations) {
  return {
    id: listing.id,
    title: listing.title,
    price: listing.price,
    free: listing.price === 0,
    category: listing.category.slug,
    categoryName: listing.category.name,
    department: listing.department,
    condition: listing.condition,
    description: listing.description,
    photoCount: listing.photoCount,
    distanceMeters: listing.distanceMeters,
    location: listing.location,
    status: listing.status,
    views: listing.views,
    saves: listing._count?.savedBy ?? 0,
    handover: listing.handover,
    postedAt: listing.createdAt,
    seller: serializeSeller(listing.seller),
  };
}
