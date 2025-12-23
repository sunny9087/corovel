import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { getLeaderboardWithUser } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireAuth();
    const leaderboard = await getLeaderboardWithUser(user.id, 10);

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
