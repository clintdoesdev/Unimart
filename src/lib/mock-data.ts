import type {
  Category,
  Conversation,
  Listing,
  NotificationItem,
  Order,
  Review,
  Seller,
  WalletLedgerEntry,
} from "./types";

export const CAMPUSES = [
  "North Campus",
  "South Campus",
  "Riverside Campus",
  "Tech Park Campus",
];

export const ALLOWED_EMAIL_DOMAINS = ["edu", "ac.in", "university.edu"];

export const INTEREST_OPTIONS: { id: string; label: string }[] = [
  { id: "textbooks", label: "Textbooks" },
  { id: "lab-kits", label: "Lab kits" },
  { id: "electronics", label: "Electronics" },
  { id: "hostel", label: "Hostel stuff" },
  { id: "bikes", label: "Bikes" },
  { id: "merch", label: "Merch" },
  { id: "tickets", label: "Tickets" },
  { id: "tutoring", label: "Tutoring" },
  { id: "furniture", label: "Furniture" },
];

export const CATEGORIES: Category[] = [
  { id: "textbooks", name: "Textbooks", icon: "book", listingCount: 214 },
  { id: "lab-kits", name: "Lab kits", icon: "flask-conical", listingCount: 42 },
  { id: "electronics", name: "Electronics", icon: "laptop", listingCount: 156 },
  { id: "hostel", name: "Hostel stuff", icon: "lamp", listingCount: 98 },
  { id: "bikes", name: "Bikes", icon: "bike", listingCount: 37 },
  { id: "merch", name: "Merch", icon: "shirt", listingCount: 63 },
  { id: "tickets", name: "Tickets", icon: "ticket", listingCount: 21 },
  { id: "tutoring", name: "Tutoring", icon: "graduation-cap", listingCount: 29 },
  { id: "furniture", name: "Furniture", icon: "sofa", listingCount: 54 },
];

export const SELLERS: Seller[] = [
  { id: "s1", name: "Rohan M.", course: "CSE", year: 3, campus: "North Campus", rating: 4.8, salesCount: 34, reviewCount: 23, verified: true, joined: "2023" },
  { id: "s2", name: "Priya S.", course: "ECE", year: 2, campus: "North Campus", rating: 4.6, salesCount: 19, reviewCount: 14, verified: true, joined: "2024" },
  { id: "s3", name: "Aman K.", course: "Mech", year: 4, campus: "South Campus", rating: 4.9, salesCount: 58, reviewCount: 41, verified: true, joined: "2022" },
  { id: "s4", name: "Sara T.", course: "Bio", year: 1, campus: "Riverside Campus", rating: 4.3, salesCount: 6, reviewCount: 4, verified: true, joined: "2025" },
  { id: "s5", name: "Vikram J.", course: "Civil", year: 3, campus: "Tech Park Campus", rating: 4.7, salesCount: 27, reviewCount: 20, verified: false, joined: "2023" },
  { id: "s6", name: "Neha R.", course: "CSE", year: 2, campus: "North Campus", rating: 5.0, salesCount: 12, reviewCount: 9, verified: true, joined: "2024" },
];

const conditions: Listing["condition"][] = ["new", "like-new", "good", "fair"];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

const listingSeed: Array<[string, number, Listing["category"], string]> = [
  ["Data Structures & Algorithms — 4th Ed", 450, "textbooks", "CSE"],
  ["Digital Logic Design textbook", 300, "textbooks", "ECE"],
  ["Casio FX-991 scientific calculator", 550, "lab-kits", "Mech"],
  ["Arduino Uno starter kit", 900, "electronics", "ECE"],
  ["Study desk lamp, warm white", 350, "hostel", "Civil"],
  ["Hero Sprint bicycle, well maintained", 3200, "bikes", "Mech"],
  ["Dept fest hoodie, size M", 400, "merch", "CSE"],
  ["Fresher's week concert ticket", 250, "tickets", "Bio"],
  ["Calculus tutoring, 1st years", 200, "tutoring", "CSE"],
  ["Study table + chair combo", 1200, "furniture", "ECE"],
  ["Organic Chemistry lab manual", 180, "textbooks", "Bio"],
  ["Used dissection kit, complete", 220, "lab-kits", "Bio"],
  ["Dell Inspiron laptop, 8GB RAM", 24000, "electronics", "CSE"],
  ["Hostel bucket + mug set", 0, "hostel", "Civil"],
  ["Mountain bike, 21-speed", 4500, "bikes", "Mech"],
  ["Alumni meet T-shirt, unused", 150, "merch", "Civil"],
  ["Cultural night entry pass", 100, "tickets", "ECE"],
  ["Physics tutoring, semester 1-2", 250, "tutoring", "Mech"],
  ["Bookshelf, 3-tier wooden", 700, "furniture", "Bio"],
  ["Engineering drawing kit", 260, "lab-kits", "Civil"],
  ["Thermodynamics textbook, 6th ed", 380, "textbooks", "Mech"],
  ["Noise-cancelling headphones", 2200, "electronics", "CSE"],
  ["Hostel mattress topper", 500, "hostel", "ECE"],
  ["Free NCERT set, giving away", 0, "textbooks", "Bio"],
];

export const LISTINGS: Listing[] = listingSeed.map(([title, price, category, department], i) => ({
  id: `l${i + 1}`,
  title,
  price,
  category,
  department,
  condition: pick(conditions, i),
  description:
    "Barely used, kept in great condition. Selling because I no longer need it — happy to answer questions before you buy. Pickup available on campus at a time that works for you.",
  photos: (i % 4) + 1,
  sellerId: pick(SELLERS, i).id,
  distanceMeters: 100 + i * 73,
  location: pick(CAMPUSES, i),
  postedAt: `${(i % 6) + 1}d ago`,
  status: "live",
  saves: (i * 7) % 40,
  views: 40 + i * 11,
  free: price === 0,
  handover: i % 3 === 0 ? ["locker", "meet"] : i % 3 === 1 ? ["meet", "deliver"] : ["locker", "meet", "deliver"],
}));

export const REVIEWS: Review[] = [
  { id: "r1", authorName: "Ananya P.", rating: 5, tags: ["On time", "As described"], note: "Smooth handover, exactly as posted.", createdAt: "2 weeks ago" },
  { id: "r2", authorName: "Karan D.", rating: 4, tags: ["Fair price"], createdAt: "1 month ago" },
  { id: "r3", authorName: "Meera V.", rating: 5, tags: ["Friendly", "On time"], note: "Great seller, would buy again.", createdAt: "1 month ago" },
];

export const ORDERS: Order[] = [
  {
    id: "ORD-2291",
    role: "buying",
    sellerId: "s1",
    buyerName: "You",
    items: [{ listingId: "l1", title: "Data Structures & Algorithms — 4th Ed", price: 450, qty: 1 }],
    subtotal: 450,
    handoverCost: 0,
    discount: 50,
    total: 400,
    handoverMethod: "locker",
    status: "ready-for-pickup",
    pickupCode: "7K42",
    timeline: [
      { label: "Paid", timestamp: "Today, 10:02 AM", done: true },
      { label: "Dropped at locker", timestamp: "Today, 2:15 PM", done: true },
      { label: "Collected by you", done: false },
    ],
    createdAt: "Today",
    reviewed: false,
  },
  {
    id: "ORD-2280",
    role: "buying",
    sellerId: "s3",
    buyerName: "You",
    items: [{ listingId: "l3", title: "Casio FX-991 scientific calculator", price: 550, qty: 1 }],
    subtotal: 550,
    handoverCost: 30,
    discount: 0,
    total: 580,
    handoverMethod: "deliver",
    status: "completed",
    pickupCode: "9B31",
    timeline: [
      { label: "Paid", timestamp: "3 days ago", done: true },
      { label: "Dropped at locker", timestamp: "3 days ago", done: true },
      { label: "Collected by you", timestamp: "2 days ago", done: true },
    ],
    createdAt: "3 days ago",
    reviewed: false,
  },
  {
    id: "ORD-2265",
    role: "selling",
    sellerId: "s1",
    buyerName: "Ishaan G.",
    items: [{ listingId: "l7", title: "Dept fest hoodie, size M", price: 400, qty: 1 }],
    subtotal: 400,
    handoverCost: 0,
    discount: 0,
    total: 400,
    handoverMethod: "meet",
    status: "completed",
    pickupCode: "4C88",
    timeline: [
      { label: "Paid", timestamp: "1 week ago", done: true },
      { label: "Dropped at locker", timestamp: "1 week ago", done: true },
      { label: "Collected by you", timestamp: "1 week ago", done: true },
    ],
    createdAt: "1 week ago",
    reviewed: true,
  },
];

export const CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    sellerId: "s1",
    listingId: "l1",
    lastMessagePreview: "Sure, locker pickup works for me",
    updatedAt: "2m ago",
    unreadCount: 2,
    online: true,
    messages: [
      { id: "m1", from: "them", text: "Hey! Still interested in the DSA book?", sentAt: "10:02 AM" },
      { id: "m2", from: "me", text: "Yes! Is the price negotiable?", sentAt: "10:03 AM" },
      { id: "m3", from: "me", offerAmount: 400, offerStatus: "pending", sentAt: "10:03 AM" },
      { id: "m4", from: "them", text: "Sure, locker pickup works for me", sentAt: "10:05 AM" },
    ],
  },
  {
    id: "c2",
    sellerId: "s3",
    listingId: "l3",
    lastMessagePreview: "It's in great condition, barely used",
    updatedAt: "1h ago",
    unreadCount: 0,
    online: false,
    messages: [
      { id: "m5", from: "me", text: "Does the calculator come with a case?", sentAt: "9:00 AM" },
      { id: "m6", from: "them", text: "It's in great condition, barely used", sentAt: "9:20 AM" },
    ],
  },
  {
    id: "c3",
    sellerId: "s6",
    listingId: "l13",
    lastMessagePreview: "Can you do 20k for the laptop?",
    updatedAt: "1d ago",
    unreadCount: 1,
    online: true,
    messages: [
      { id: "m7", from: "me", text: "Can you do 20k for the laptop?", sentAt: "Yesterday" },
    ],
  },
];

export const NOTIFICATIONS: NotificationItem[] = [
  { id: "n1", message: "Rohan M. accepted your offer of ₹400", createdAt: "10m ago", read: false, group: "today" },
  { id: "n2", message: "Your order ORD-2291 is ready for pickup at the library locker", createdAt: "3h ago", read: false, group: "today" },
  { id: "n3", message: "New message from Aman K.", createdAt: "5h ago", read: true, group: "today" },
  { id: "n4", message: "Your listing 'Dept fest hoodie' got 3 new saves", createdAt: "1d ago", read: true, group: "earlier" },
  { id: "n5", message: "Payout of ₹400 credited to your wallet", createdAt: "2d ago", read: true, group: "earlier" },
];

export const WALLET_LEDGER: WalletLedgerEntry[] = [
  { id: "w1", label: "Payout — Dept fest hoodie sale", amount: 400, type: "credit", createdAt: "2 days ago" },
  { id: "w2", label: "Withdraw to bank", amount: 1000, type: "debit", createdAt: "5 days ago" },
  { id: "w3", label: "Payout — Old lab manual sale", amount: 180, type: "credit", createdAt: "1 week ago" },
  { id: "w4", label: "Top up via UPI", amount: 500, type: "credit", createdAt: "2 weeks ago" },
];

export const WALLET_BALANCE = 720;

export function getListing(id: string): Listing | undefined {
  return LISTINGS.find((l) => l.id === id);
}

export function getSeller(id: string): Seller | undefined {
  return SELLERS.find((s) => s.id === id);
}

export function listingsBySeller(sellerId: string): Listing[] {
  return LISTINGS.filter((l) => l.sellerId === sellerId);
}

export function conditionLabel(c: Listing["condition"]): string {
  return { new: "New", "like-new": "Like new", good: "Good", fair: "Fair" }[c];
}

export function handoverLabel(h: Listing["handover"][number]): string {
  return { locker: "Campus pickup point", meet: "Meet the seller", deliver: "Hostel delivery" }[h];
}
