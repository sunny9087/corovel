import { PrismaClient } from "./generated/prisma/client";
// In development, ensure environment variables from .env are loaded
if (process.env.NODE_ENV !== "production" && !process.env.DATABASE_URL) {
  import("dotenv").then((dotenv) => {
    try {
      dotenv.config();
    } catch {
      // ignore if dotenv config fails
    }
  }).catch(() => {
    // ignore if dotenv isn't available
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Helper to resolve the current database URL at runtime
function resolveDatabaseUrl() {
  return process.env.DATABASE_URL || "file:./dev.db";
}

// Since the schema is SQLite, we use PrismaClient with SQLite adapter
// For local: Uses DATABASE_URL from .env file or defaults to file:./dev.db
function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  // Only throw error in production/Vercel - for local dev, provide helpful message
  const databaseUrl = resolveDatabaseUrl();
  if (!databaseUrl) {
    const isVercel = process.env.VERCEL === "1";
    const isProduction = process.env.NODE_ENV === "production";
    
    if (isVercel || isProduction) {
      throw new Error(
        "DATABASE_URL environment variable is required. " +
        "For Vercel: This should be set to your PostgreSQL connection string."
      );
    }
  }

  // Create PrismaClient instance (Prisma manages the underlying SQLite or Postgres connection
  // via the DATABASE_URL environment variable). No adapter is required here.
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
}

// Lazy initialization - only create client when actually used
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (client as any)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

