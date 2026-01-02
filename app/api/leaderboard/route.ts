import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAuth();
    return NextResponse.json(
      {
        error: "This endpoint has been retired. Progress is personal-only in Corovel.",
      },
      { status: 410 }
    );
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
