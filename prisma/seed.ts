import "dotenv/config";
import { PrismaClient, Condition, HandoverMethod, OrderStatus, LedgerType } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const DEMO_PASSWORD = "password123";

const CATEGORIES = [
  { slug: "textbooks", name: "Textbooks", icon: "book" },
  { slug: "lab-kits", name: "Lab kits", icon: "flask-conical" },
  { slug: "electronics", name: "Electronics", icon: "laptop" },
  { slug: "hostel", name: "Hostel stuff", icon: "lamp" },
  { slug: "bikes", name: "Bikes", icon: "bike" },
  { slug: "merch", name: "Merch", icon: "shirt" },
  { slug: "tickets", name: "Tickets", icon: "ticket" },
  { slug: "tutoring", name: "Tutoring", icon: "graduation-cap" },
  { slug: "furniture", name: "Furniture", icon: "sofa" },
];

const CAMPUSES = ["North Campus", "South Campus", "Riverside Campus", "Tech Park Campus"];

async function main() {
  console.log("Seeding categories...");
  const categories = new Map<string, string>();
  for (const c of CATEGORIES) {
    const row = await db.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, icon: c.icon },
      create: c,
    });
    categories.set(c.slug, row.id);
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const now = new Date();

  console.log("Seeding student sellers...");
  const students = await Promise.all(
    [
      { email: "rohan.m@university.edu", fullName: "Rohan M.", campus: "North Campus", course: "CSE", year: 3, interests: ["textbooks", "electronics", "bikes"] },
      { email: "priya.s@university.edu", fullName: "Priya S.", campus: "North Campus", course: "ECE", year: 2, interests: ["electronics", "tutoring"] },
      { email: "aman.k@university.edu", fullName: "Aman K.", campus: "South Campus", course: "Mech", year: 4, interests: ["bikes", "lab-kits"] },
      { email: "sara.t@university.edu", fullName: "Sara T.", campus: "Riverside Campus", course: "Bio", year: 1, interests: ["textbooks", "furniture"] },
      { email: "vikram.j@university.edu", fullName: "Vikram J.", campus: "Tech Park Campus", course: "Civil", year: 3, interests: ["hostel", "furniture"] },
      { email: "neha.r@university.edu", fullName: "Neha R.", campus: "North Campus", course: "CSE", year: 2, interests: ["electronics", "merch"] },
      { email: "ishaan.g@university.edu", fullName: "Ishaan G.", campus: "North Campus", course: "CSE", year: 2, interests: ["merch", "tickets"] },
    ].map((s) =>
      db.user.upsert({
        where: { email: s.email },
        update: {},
        create: { ...s, passwordHash, role: "STUDENT", emailVerifiedAt: now, walletBalance: 0 },
      })
    )
  );
  const [rohan, priya, aman, sara, vikram, neha, ishaan] = students;

  // Demo wallet + a few ledger entries for the primary demo account.
  await db.user.update({ where: { id: rohan.id }, data: { walletBalance: 720 } });
  await db.walletLedgerEntry.createMany({
    data: [
      { userId: rohan.id, label: "Payout — Dept fest hoodie sale", amount: 400, type: LedgerType.CREDIT },
      { userId: rohan.id, label: "Withdraw to bank", amount: 1000, type: LedgerType.DEBIT },
      { userId: rohan.id, label: "Payout — Old lab manual sale", amount: 180, type: LedgerType.CREDIT },
      { userId: rohan.id, label: "Top up via UPI", amount: 500, type: LedgerType.CREDIT },
    ],
  });

  console.log("Seeding vendors...");
  const vendorSeeds = [
    {
      email: "hello@campuscafe.university.edu",
      fullName: "Campus Cafe",
      campus: "North Campus",
      businessName: "Campus Cafe",
      category: "Food & Drink",
      description: "Fresh filter coffee, sandwiches and late-night snacks, two minutes from the library.",
      status: "APPROVED" as const,
    },
    {
      email: "orders@quickxerox.university.edu",
      fullName: "Quick Xerox & Print",
      campus: "North Campus",
      businessName: "Quick Xerox & Print",
      category: "Printing & Stationery",
      description: "Same-day printing, spiral binding and stationery for assignments and projects.",
      status: "APPROVED" as const,
    },
    {
      email: "bookings@primetutors.university.edu",
      fullName: "Prime Tutors Collective",
      campus: "South Campus",
      businessName: "Prime Tutors Collective",
      category: "Tutoring & Coaching",
      description: "Small-group coaching for core engineering subjects, run by senior students and alumni.",
      status: "PENDING" as const,
    },
  ];
  const vendorUsers = [];
  for (const v of vendorSeeds) {
    const user = await db.user.upsert({
      where: { email: v.email },
      update: {},
      create: {
        email: v.email,
        fullName: v.fullName,
        campus: v.campus,
        course: "",
        year: 0,
        passwordHash,
        role: "VENDOR",
        emailVerifiedAt: now,
      },
    });
    const vendor = await db.vendor.upsert({
      where: { ownerId: user.id },
      update: {},
      create: {
        ownerId: user.id,
        businessName: v.businessName,
        category: v.category,
        description: v.description,
        campus: v.campus,
        status: v.status,
        approvedAt: v.status === "APPROVED" ? now : null,
      },
    });
    vendorUsers.push({ user, vendor });
  }
  const [cafe, xerox] = vendorUsers;

  console.log("Seeding admin...");
  await db.user.upsert({
    where: { email: "admin@university.edu" },
    update: {},
    create: {
      email: "admin@university.edu",
      fullName: "Uni Mart Admin",
      campus: "North Campus",
      course: "",
      year: 0,
      passwordHash,
      role: "ADMIN",
      emailVerifiedAt: now,
    },
  });

  console.log("Seeding listings...");
  type ListingSeed = {
    title: string;
    price: number;
    category: string;
    department: string;
    condition: Condition;
    sellerId: string;
    location: string;
    handover: HandoverMethod[];
    photoCount?: number;
    distanceMeters?: number;
  };

  const conditions: Condition[] = [Condition.NEW, Condition.LIKE_NEW, Condition.GOOD, Condition.FAIR];
  const sellerPool = [rohan, priya, aman, sara, vikram, neha];

  const studentSeeds: ListingSeed[] = [
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
  ].map(([title, price, category, department], i) => ({
    title: title as string,
    price: price as number,
    category: category as string,
    department: department as string,
    condition: conditions[i % conditions.length],
    sellerId: sellerPool[i % sellerPool.length].id,
    location: CAMPUSES[i % CAMPUSES.length],
    handover:
      i % 3 === 0
        ? [HandoverMethod.LOCKER, HandoverMethod.MEET]
        : i % 3 === 1
          ? [HandoverMethod.MEET, HandoverMethod.DELIVER]
          : [HandoverMethod.LOCKER, HandoverMethod.MEET, HandoverMethod.DELIVER],
    photoCount: (i % 4) + 1,
    distanceMeters: 100 + i * 73,
  }));

  const vendorListingSeeds: ListingSeed[] = [
    {
      title: "Filter coffee — 10 punch card",
      price: 300,
      category: "merch",
      department: "Campus Cafe",
      condition: Condition.NEW,
      sellerId: cafe.user.id,
      location: cafe.vendor.campus,
      handover: [HandoverMethod.MEET],
      photoCount: 2,
      distanceMeters: 80,
    },
    {
      title: "Grab-and-go sandwich combo (veg)",
      price: 120,
      category: "merch",
      department: "Campus Cafe",
      condition: Condition.NEW,
      sellerId: cafe.user.id,
      location: cafe.vendor.campus,
      handover: [HandoverMethod.MEET],
      photoCount: 1,
      distanceMeters: 80,
    },
    {
      title: "Assignment printing bundle — 100 pages B/W",
      price: 150,
      category: "lab-kits",
      department: "Quick Xerox & Print",
      condition: Condition.NEW,
      sellerId: xerox.user.id,
      location: xerox.vendor.campus,
      handover: [HandoverMethod.LOCKER, HandoverMethod.MEET],
      photoCount: 1,
      distanceMeters: 150,
    },
    {
      title: "Spiral binding + lamination combo",
      price: 90,
      category: "lab-kits",
      department: "Quick Xerox & Print",
      condition: Condition.NEW,
      sellerId: xerox.user.id,
      location: xerox.vendor.campus,
      handover: [HandoverMethod.LOCKER, HandoverMethod.MEET],
      photoCount: 1,
      distanceMeters: 150,
    },
  ];

  const allListingSeeds = [...studentSeeds, ...vendorListingSeeds];
  const listingIds: Record<string, string> = {};
  for (const l of allListingSeeds) {
    const created = await db.listing.create({
      data: {
        title: l.title,
        price: l.price,
        categoryId: categories.get(l.category)!,
        department: l.department,
        condition: l.condition,
        description:
          "Barely used, kept in great condition. Selling because I no longer need it — happy to answer questions before you buy. Pickup available on campus at a time that works for you.",
        photoCount: l.photoCount ?? 1,
        distanceMeters: l.distanceMeters ?? 0,
        location: l.location,
        handover: l.handover,
        sellerId: l.sellerId,
      },
    });
    listingIds[l.title] = created.id;
  }

  console.log("Seeding orders...");
  const dsaListingId = listingIds["Data Structures & Algorithms — 4th Ed"];
  const calcListingId = listingIds["Casio FX-991 scientific calculator"];
  const hoodieListingId = listingIds["Dept fest hoodie, size M"];

  await db.order.create({
    data: {
      orderNumber: "ORD-2291",
      buyerId: rohan.id,
      sellerId: priya.id,
      subtotal: 450,
      handoverCost: 0,
      discount: 50,
      total: 400,
      handoverMethod: HandoverMethod.LOCKER,
      status: OrderStatus.READY_FOR_PICKUP,
      pickupCode: "7K42",
      droppedAt: now,
      items: { create: [{ listingId: dsaListingId, title: "Data Structures & Algorithms — 4th Ed", price: 450, qty: 1 }] },
    },
  });
  await db.order.create({
    data: {
      orderNumber: "ORD-2280",
      buyerId: rohan.id,
      sellerId: aman.id,
      subtotal: 550,
      handoverCost: 30,
      discount: 0,
      total: 580,
      handoverMethod: HandoverMethod.DELIVER,
      status: OrderStatus.COMPLETED,
      pickupCode: "9B31",
      droppedAt: now,
      collectedAt: now,
      items: { create: [{ listingId: calcListingId, title: "Casio FX-991 scientific calculator", price: 550, qty: 1 }] },
    },
  });
  const order3 = await db.order.create({
    data: {
      orderNumber: "ORD-2265",
      buyerId: ishaan.id,
      sellerId: rohan.id,
      subtotal: 400,
      handoverCost: 0,
      discount: 0,
      total: 400,
      handoverMethod: HandoverMethod.MEET,
      status: OrderStatus.COMPLETED,
      pickupCode: "4C88",
      droppedAt: now,
      collectedAt: now,
      reviewed: true,
      items: { create: [{ listingId: hoodieListingId, title: "Dept fest hoodie, size M", price: 400, qty: 1 }] },
    },
  });
  await db.review.create({
    data: {
      orderId: order3.id,
      authorId: ishaan.id,
      targetId: rohan.id,
      rating: 5,
      tags: ["On time", "As described"],
      note: "Smooth handover, exactly as posted.",
    },
  });

  console.log("Seeding conversations...");
  const conv1 = await db.conversation.create({
    data: { listingId: dsaListingId, buyerId: rohan.id, sellerId: priya.id },
  });
  await db.message.createMany({
    data: [
      { conversationId: conv1.id, senderId: priya.id, text: "Hey! Still interested in the DSA book?" },
      { conversationId: conv1.id, senderId: rohan.id, text: "Yes! Is the price negotiable?" },
      { conversationId: conv1.id, senderId: rohan.id, offerAmount: 400, offerStatus: "PENDING" },
      { conversationId: conv1.id, senderId: priya.id, text: "Sure, locker pickup works for me" },
    ],
  });

  const conv2 = await db.conversation.create({
    data: { listingId: calcListingId, buyerId: rohan.id, sellerId: aman.id },
  });
  await db.message.createMany({
    data: [
      { conversationId: conv2.id, senderId: rohan.id, text: "Does the calculator come with a case?" },
      { conversationId: conv2.id, senderId: aman.id, text: "It's in great condition, barely used" },
    ],
  });

  const laptopListingId = listingIds["Dell Inspiron laptop, 8GB RAM"];
  const conv3 = await db.conversation.create({
    data: { listingId: laptopListingId, buyerId: rohan.id, sellerId: neha.id },
  });
  await db.message.create({
    data: { conversationId: conv3.id, senderId: rohan.id, text: "Can you do 20k for the laptop?" },
  });

  console.log("Seeding notifications...");
  await db.notification.createMany({
    data: [
      { userId: rohan.id, message: "Priya S. accepted your offer of ₹400", read: false },
      { userId: rohan.id, message: "Your order ORD-2291 is ready for pickup at the library locker", read: false },
      { userId: rohan.id, message: "New message from Aman K.", read: true },
      { userId: rohan.id, message: "Your listing 'Dept fest hoodie' got 3 new saves", read: true },
      { userId: rohan.id, message: "Payout of ₹400 credited to your wallet", read: true },
    ],
  });

  console.log("Seeding saved listings...");
  await db.savedListing.createMany({
    data: [
      { userId: rohan.id, listingId: listingIds["Arduino Uno starter kit"] },
      { userId: rohan.id, listingId: listingIds["Mountain bike, 21-speed"] },
    ],
    skipDuplicates: true,
  });

  console.log("\nSeed complete.");
  console.log("Demo login: rohan.m@university.edu / " + DEMO_PASSWORD);
  console.log("Vendor login (approved, Campus Cafe): hello@campuscafe.university.edu / " + DEMO_PASSWORD);
  console.log("Vendor login (pending approval, Prime Tutors): bookings@primetutors.university.edu / " + DEMO_PASSWORD);
  console.log("Admin login: admin@university.edu / " + DEMO_PASSWORD);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
