export type Condition = "NEW" | "LIKE_NEW" | "GOOD" | "FAIR";
export type HandoverMethod = "LOCKER" | "MEET" | "DELIVER";
export type ListingStatus = "LIVE" | "DRAFT" | "SOLD";
export type OrderStatus = "PAID" | "DROPPED" | "READY_FOR_PICKUP" | "COMPLETED" | "CANCELLED";
export type OfferStatus = "PENDING" | "ACCEPTED" | "DECLINED";
export type UserRole = "STUDENT" | "VENDOR" | "ADMIN";
export type VendorStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

export interface Category {
  id: string;
  name: string;
  icon: string;
  listingCount: number;
}

export interface SellerSummary {
  id: string;
  name: string;
  course: string;
  year: number;
  campus: string;
  isVendor: boolean;
  vendor: { businessName: string; category: string; verified: true } | null;
}

export interface Listing {
  id: string;
  title: string;
  price: number;
  free: boolean;
  category: string;
  categoryName: string;
  department: string;
  condition: Condition;
  description: string;
  photoCount: number;
  distanceMeters: number;
  location: string;
  status: ListingStatus;
  views: number;
  saves: number;
  handover: HandoverMethod[];
  postedAt: string;
  seller: SellerSummary;
  saved?: boolean;
}

export interface SellerProfile {
  id: string;
  name: string;
  course: string;
  year: number;
  campus: string;
  rating: number;
  salesCount: number;
  reviewCount: number;
  verified: boolean;
  isVendor: boolean;
  vendor: { businessName: string; category: string; description: string } | null;
}

export interface Review {
  id: string;
  authorName: string;
  rating: number;
  tags: string[];
  note?: string | null;
  createdAt: string;
}

export interface CartLine {
  listingId: string;
  title: string;
  price: number;
  qty: number;
}

export interface CartGroup {
  sellerId: string;
  seller: SellerSummary;
  lines: CartLine[];
}

export interface OrderItemView {
  listingId: string | null;
  title: string;
  price: number;
  qty: number;
}

export interface TimelineStep {
  label: string;
  timestamp: string | null;
  done: boolean;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  role: "buying" | "selling";
  counterpartName: string;
  items: OrderItemView[];
  subtotal: number;
  handoverCost: number;
  discount: number;
  total: number;
  handoverMethod: HandoverMethod;
  status: OrderStatus;
  pickupCode: string;
  reviewed: boolean;
  createdAt: string;
}

export interface OrderDetail extends OrderSummary {
  sellerId: string;
  timeline: TimelineStep[];
}

export interface ChatMessage {
  id: string;
  from: "me" | "them";
  text?: string | null;
  offerAmount?: number | null;
  offerStatus?: OfferStatus | null;
  createdAt: string;
}

export interface ConversationSummary {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  counterpartId: string;
  counterpartName: string;
  lastMessagePreview: string;
  updatedAt: string;
  unreadCount: number;
}

export interface ConversationDetail {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  counterpartId: string;
  counterpartName: string;
  messages: ChatMessage[];
}

export interface NotificationItem {
  id: string;
  message: string;
  createdAt: string;
  read: boolean;
  group: "today" | "earlier";
}

export interface WalletLedgerEntry {
  id: string;
  label: string;
  amount: number;
  type: "CREDIT" | "DEBIT";
  createdAt: string;
}

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  campus: string;
  course: string;
  year: number;
  role: UserRole;
  interests: string[];
  walletBalance: number;
  emailVerifiedAt: string | null;
}

export interface VendorInfo {
  id: string;
  businessName: string;
  category: string;
  description: string;
  campus: string;
  status: VendorStatus;
  approvedAt: string | null;
}
