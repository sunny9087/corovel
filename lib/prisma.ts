import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Get database URL - use POSTGRES_PRISMA_URL (Vercel) or DATABASE_URL
// For Vercel: Uses POSTGRES_PRISMA_URL (auto-set by Vercel)
// For local: Uses DATABASE_URL from .env file (must be PostgreSQL connection string)
const databaseUrl = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL;

// Create PrismaClient with PostgreSQL adapter
// Prisma 7.2.0 requires adapter for PostgreSQL when using custom output
function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  if (!databaseUrl) {
    const isVercel = process.env.VERCEL === "1";
    const isProduction = process.env.NODE_ENV === "production";
    
    if (isVercel || isProduction) {
      throw new Error(
        "DATABASE_URL or POSTGRES_PRISMA_URL environment variable is required. " +
        "For Vercel: This is auto-set when you create a Postgres database. " +
        "Check: Vercel Dashboard → Storage → Postgres → Ensure database exists."
      );
    } else {
      // Local development - provide helpful error
      throw new Error(
        "DATABASE_URL environment variable is required for local development.\n" +
        "Since the schema is PostgreSQL, you need a PostgreSQL database.\n" +
        "Options:\n" +
        "1. Set DATABASE_URL in your .env file to a PostgreSQL connection string\n" +
        "2. Use a local PostgreSQL database or a cloud service (Supabase, Vercel Postgres, etc.)\n" +
        "Example: DATABASE_URL=\"postgresql://user:password@localhost:5432/dbname\""
      );
    }
  }

  // Validate that it's a PostgreSQL connection string
  if (!databaseUrl.startsWith("postgresql://") && !databaseUrl.startsWith("postgres://")) {
    throw new Error(
      "DATABASE_URL must be a PostgreSQL connection string starting with 'postgresql://' or 'postgres://'.\n" +
      `Current value starts with: ${databaseUrl.substring(0, 10)}...`
    );
  }

  // Create PostgreSQL connection pool
  // Ensure SSL works in production environments (e.g., Supabase pooler)
  // Some providers present cert chains that require disabling strict validation
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  });

  // Create Prisma adapter
  const adapter = new PrismaPg(pool);

  // Create PrismaClient with adapter
  const client = new PrismaClient({
    adapter,
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

