import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export type DatabaseUrlInfo = {
  host: string;
  port: string;
  user: string;
  db: string;
  isPooler: boolean;
  hasPgbouncerParam: boolean;
};

function isSupabaseUrl(url: string): boolean {
  return url.includes("supabase.co") || url.includes("pooler.supabase.com");
}

// Supabase supports two common Postgres endpoints:
// - Direct:   db.<ref>.supabase.co:5432
// - Pooler:   aws-0-<region>.pooler.supabase.com:6543 (recommended for serverless)
// Mis-matching host/port is a frequent cause of Prisma P1001 (can't reach server).
export function normalizeDatabaseUrl(inputUrl: string): string {
  if (!inputUrl) return inputUrl;
  if (!isSupabaseUrl(inputUrl)) return inputUrl;

  try {
    const urlObj = new URL(inputUrl);

    // Remove sslmode if present (node-postgres doesn't use libpq parameters).
    urlObj.searchParams.delete("sslmode");

    const isPooler = urlObj.hostname.includes("pooler.supabase.com");
    const isDirectDbHost = /^db\.[a-z0-9-]+\.supabase\.co$/i.test(urlObj.hostname);

    if (isPooler) {
      // Pooler commonly uses 6543, but do not override an explicitly provided port.
      if (!urlObj.port) {
        urlObj.port = "6543";
      }

      // Pooler works best with pgbouncer mode enabled.
      if (!urlObj.searchParams.has("pgbouncer")) {
        urlObj.searchParams.set("pgbouncer", "true");
      }
    }

    if (isDirectDbHost) {
      // Direct database listens on 5432.
      if (urlObj.port === "6543") {
        urlObj.port = "5432";
      }

      // pgbouncer is not applicable to the direct endpoint.
      urlObj.searchParams.delete("pgbouncer");
    }

    return urlObj.toString();
  } catch {
    return inputUrl;
  }
}

export function getDatabaseUrlInfo(inputUrl: string | undefined): DatabaseUrlInfo | null {
  if (!inputUrl) return null;
  try {
    const urlObj = new URL(inputUrl);
    return {
      host: urlObj.hostname,
      port: urlObj.port || "(default)",
      user: urlObj.username || "(none)",
      db: urlObj.pathname.replace("/", "") || "(none)",
      isPooler: urlObj.hostname.includes("pooler.supabase.com"),
      hasPgbouncerParam: urlObj.searchParams.get("pgbouncer") === "true",
    };
  } catch {
    return null;
  }
}

// Get database URL - use POSTGRES_PRISMA_URL (Vercel) or DATABASE_URL
// For Vercel: Uses POSTGRES_PRISMA_URL (auto-set by Vercel)
// For local: Uses DATABASE_URL from .env file (must be PostgreSQL connection string)
function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL || "";
  const vercelUrl = process.env.POSTGRES_PRISMA_URL || "";

  // IMPORTANT: Prefer DATABASE_URL whenever it's present.
  // Vercel can inject POSTGRES_PRISMA_URL automatically, which can accidentally
  // override Supabase and point Prisma at the wrong database.
  let url = databaseUrl || vercelUrl;

  // Normalize Supabase URLs (pooler/direct ports, pgbouncer param, sslmode removal)
  url = normalizeDatabaseUrl(url);
  
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

    try {
      const urlObj = new URL(databaseUrl);
      const source = process.env.DATABASE_URL
        ? "DATABASE_URL"
        : process.env.POSTGRES_PRISMA_URL
          ? "POSTGRES_PRISMA_URL"
          : "(none)";
      console.log("[Prisma] URL source:", source);
      console.log("[Prisma] Host:", urlObj.hostname);
      console.log("[Prisma] Port:", urlObj.port || "(default)");
      console.log("[Prisma] User:", urlObj.username || "(none)");
      console.log("[Prisma] DB:", urlObj.pathname.replace("/", "") || "(none)");
      if (urlObj.hostname.includes("pooler.supabase.com")) {
        console.log("[Prisma] Pooler:", true);
        console.log("[Prisma] pgbouncer param:", urlObj.searchParams.get("pgbouncer") || "(missing)");
      }
    } catch {
      // ignore
    }
  }
  
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: sslConfig,
    // Connection timeout - increased for cold starts
    connectionTimeoutMillis: 30000,
    // Idle timeout
    idleTimeoutMillis: 30000,
    // Max connections
    max: 10,
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

