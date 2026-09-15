import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedDemoData, DEMO_PASSWORD } from "../src/lib/server/seed";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

seedDemoData(db)
  .then(() => {
    console.log("\nDemo login: rohan.m@university.edu / " + DEMO_PASSWORD);
    console.log("Vendor login (approved, Campus Cafe): hello@campuscafe.university.edu / " + DEMO_PASSWORD);
    console.log("Vendor login (pending approval, Prime Tutors): bookings@primetutors.university.edu / " + DEMO_PASSWORD);
    console.log("Admin login: admin@university.edu / " + DEMO_PASSWORD);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
