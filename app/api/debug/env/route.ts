import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    return NextResponse.json({ hasDatabaseUrl: !!process.env.DATABASE_URL });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
