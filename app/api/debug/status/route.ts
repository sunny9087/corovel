import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getDatabaseUrlInfo, normalizeDatabaseUrl } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    // Check environment variables
    const rawDatabaseUrl = process.env.DATABASE_URL;
    const rawVercelUrl = process.env.POSTGRES_PRISMA_URL;
    const effectiveRawUrl = rawDatabaseUrl || rawVercelUrl || "";
    const effectiveNormalizedUrl = effectiveRawUrl ? normalizeDatabaseUrl(effectiveRawUrl) : "";

    const databaseUrlInfo = getDatabaseUrlInfo(rawDatabaseUrl);
    const vercelUrlInfo = getDatabaseUrlInfo(rawVercelUrl);
    const effectiveUrlInfo = getDatabaseUrlInfo(effectiveNormalizedUrl);

    const envStatus = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL_SET: !!process.env.DATABASE_URL,
      POSTGRES_PRISMA_URL_SET: !!process.env.POSTGRES_PRISMA_URL,
      DATABASE_URL_INFO: databaseUrlInfo,
      POSTGRES_PRISMA_URL_INFO: vercelUrlInfo,
      EFFECTIVE_DATABASE_URL_INFO: effectiveUrlInfo,
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
