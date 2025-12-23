import { PrismaClient } from "./generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { env } from "./env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Check if DATABASE_URL is a file path (SQLite) or connection string (PostgreSQL/other)
const isSQLite = env.DATABASE_URL.startsWith("file:");

let prismaInstance: PrismaClient;

if (isSQLite) {
  // SQLite for local development
  const dbPath = env.DATABASE_URL.replace(/^file:/, "") || "./dev.db";
  const adapter = new PrismaBetterSqlite3({
    url: dbPath,
  });
  
  prismaInstance = new PrismaClient({
    adapter,
  } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
} else {
  // PostgreSQL or other database for production (Vercel, etc.)
  // Prisma automatically uses DATABASE_URL from environment
  // Pass empty object to satisfy TypeScript - Prisma reads DATABASE_URL from env
  prismaInstance = new PrismaClient({} as any); // eslint-disable-line @typescript-eslint/no-explicit-any
}

export const prisma =
  globalForPrisma.prisma ?? prismaInstance;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

