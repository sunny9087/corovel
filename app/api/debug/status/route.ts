import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Check environment variables
    let databaseUrlInfo:
      | {
          host: string;
          port: string;
          user: string;
          db: string;
          isPooler: boolean;
          hasPgbouncerParam: boolean;
        }
      | null = null;

    try {
      if (process.env.DATABASE_URL) {
        const urlObj = new URL(process.env.DATABASE_URL);
        databaseUrlInfo = {
          host: urlObj.hostname,
          port: urlObj.port || "(default)",
          user: urlObj.username || "(none)",
          db: urlObj.pathname.replace("/", "") || "(none)",
          isPooler: urlObj.hostname.includes("pooler.supabase.com"),
          hasPgbouncerParam: urlObj.searchParams.get("pgbouncer") === "true",
        };
      }
    } catch {
      databaseUrlInfo = null;
    }

    const envStatus = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL_SET: !!process.env.DATABASE_URL,
      POSTGRES_PRISMA_URL_SET: !!process.env.POSTGRES_PRISMA_URL,
      DATABASE_URL_INFO: databaseUrlInfo,
      NEXTAUTH_URL: env.NEXTAUTH_URL,
      APP_URL: env.APP_URL,
      SESSION_SECRET_SET: !!env.SESSION_SECRET,
      NEXTAUTH_SECRET_SET: !!env.NEXTAUTH_SECRET,
      GOOGLE_CLIENT_ID_SET: !!process.env.GOOGLE_CLIENT_ID,
    };

    // Try to connect to database
    let dbStatus = "unknown";
    try {
      const { prisma } = await import("@/lib/prisma");
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = "connected";
    } catch (dbError) {
      dbStatus = `error: ${dbError instanceof Error ? dbError.message : "Unknown error"}`;
    }

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: envStatus,
      database: dbStatus,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
