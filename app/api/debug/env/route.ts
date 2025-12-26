import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({ hasDatabaseUrl: !!process.env.DATABASE_URL });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
