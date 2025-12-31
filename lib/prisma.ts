import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// CRITICAL: For Supabase connections with self-signed certificates
// This must be set BEFORE any database connections are made
// This is a known requirement for Supabase's connection pooler
if (
  process.env.NODE_ENV === "production" ||
  process.env.VERCEL === "1" ||
  (process.env.DATABASE_URL || "").includes("supabase") ||
  (process.env.POSTGRES_PRISMA_URL || "").includes("supabase")
) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Get database URL - use POSTGRES_PRISMA_URL (Vercel) or DATABASE_URL
// For Vercel: Uses POSTGRES_PRISMA_URL (auto-set by Vercel)
// For local: Uses DATABASE_URL from .env file (must be PostgreSQL connection string)
function getDatabaseUrl(): string {
  let url = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL || "";
  
  // For Supabase connections, ensure sslmode is set to allow self-signed certs
  if (url.includes("supabase.co") || url.includes("pooler.supabase.com")) {
    // Remove any existing sslmode parameter and add the correct one
    const urlObj = new URL(url);
    urlObj.searchParams.delete("sslmode");
    // Use 'require' instead of 'verify-full' to skip certificate verification
    urlObj.searchParams.set("sslmode", "require");
    url = urlObj.toString();
  }
  
  return url;
}

const databaseUrl = getDatabaseUrl();

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
  // CRITICAL: For Supabase and other cloud providers, we must disable certificate verification
  // This is because they use self-signed certificates in their certificate chain
  const isSupabase = databaseUrl.includes("supabase.co") || databaseUrl.includes("pooler.supabase.com");
  const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
  
  // SSL configuration for production/Supabase
  // rejectUnauthorized: false is required for Supabase's self-signed certs
  const sslConfig = (isSupabase || isProduction) ? {
    rejectUnauthorized: false,
  } : undefined;
  
  // Log connection info in development (without sensitive data)
  if (process.env.NODE_ENV === "development") {
    console.log("[Prisma] Connecting to database...");
    console.log("[Prisma] SSL enabled:", !!sslConfig);
    console.log("[Prisma] Is Supabase:", isSupabase);
  }
  
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: sslConfig,
    // Add connection timeout for better error handling
    connectionTimeoutMillis: 10000,
  });
  
  // Handle pool errors
  pool.on("error", (err) => {
    console.error("[Prisma] Pool error:", err.message);
  });

  // Create Prisma adapter
  const adapter = new PrismaPg(pool);

  // Create PrismaClient with adapter
  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

  // Cache the client in non-production to prevent multiple connections
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  } else {
    // In production on Vercel, also cache to prevent connection exhaustion
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

