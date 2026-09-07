export type Condition = "new" | "like-new" | "good" | "fair";

export type HandoverMethod = "locker" | "meet" | "deliver";

export type CategoryId =
  | "textbooks"
  | "lab-kits"
  | "electronics"
  | "hostel"
  | "bikes"
  | "merch"
  | "tickets"
  | "tutoring"
  | "furniture";

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  listingCount: number;
}

export interface Seller {
  id: string;
  name: string;
  course: string;
  year: number;
  campus: string;
  rating: number;
  salesCount: number;
  reviewCount: number;
  verified: boolean;
  joined: string;
}

export interface Listing {
  id: string;
  title: string;
  price: number;
  category: CategoryId;
  department: string;
  condition: Condition;
  description: string;
  photos: number;
  sellerId: string;
  distanceMeters: number;
  location: string;
  postedAt: string;
  status: "live" | "draft" | "sold";
  saves: number;
  views: number;
  free: boolean;
  handover: HandoverMethod[];
}

export interface Review {
  id: string;
  authorName: string;
  rating: number;
  tags: string[];
  note?: string;
  createdAt: string;
}

export type OrderStatus =
  | "paid"
  | "dropped"
  | "ready-for-pickup"
  | "completed"
  | "cancelled";

export interface TimelineStep {
  label: string;
  timestamp?: string;
  done: boolean;
}

export interface OrderItem {
  listingId: string;
  title: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  role: "buying" | "selling";
  sellerId: string;
  buyerName: string;
  items: OrderItem[];
  subtotal: number;
  handoverCost: number;
  discount: number;
  total: number;
  handoverMethod: HandoverMethod;
  status: OrderStatus;
  pickupCode: string;
  timeline: TimelineStep[];
  createdAt: string;
  reviewed: boolean;
}

export interface ChatMessage {
  id: string;
  from: "me" | "them";
  text?: string;
  offerAmount?: number;
  offerStatus?: "pending" | "accepted" | "declined";
  sentAt: string;
}

export interface Conversation {
  id: string;
  sellerId: string;
  listingId: string;
  lastMessagePreview: string;
  updatedAt: string;
  unreadCount: number;
  online: boolean;
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
  type: "credit" | "debit";
  createdAt: string;
}

export interface CartLine {
  listingId: string;
  qty: number;
}

export interface CartGroup {
  sellerId: string;
  lines: CartLine[];
  handoverMethod: HandoverMethod;
}
