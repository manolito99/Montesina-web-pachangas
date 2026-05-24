// Prisma client singleton — prevents multiple instances in Next.js dev mode
// Uncomment when Prisma is configured with `npx prisma generate`

// import { PrismaClient } from "@prisma/client";
//
// const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
//
// export const db = globalForPrisma.prisma || new PrismaClient();
//
// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

export {};
