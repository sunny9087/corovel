import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Check environment variables
    const envStatus = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL_SET: !!process.env.DATABASE_URL,
      POSTGRES_PRISMA_URL_SET: !!process.env.POSTGRES_PRISMA_URL,
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
