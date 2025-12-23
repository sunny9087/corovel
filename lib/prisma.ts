import { PrismaClient } from "./generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { env } from "./env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Extract database path from DATABASE_URL
const dbPath = env.DATABASE_URL.replace(/^file:/, "") || "./dev.db";

// Create adapter with database path
const adapter = new PrismaBetterSqlite3({
  url: dbPath,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

