import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { completeDailyTask, getTaskByName, checkWeeklyChallenge } from "@/lib/tasks";
import { checkInRateLimiter, getRateLimitKey } from "@/lib/rate-limit";
import { requireCsrfToken } from "@/lib/csrf";
import { trackEvent } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Rate limiting
    const identifier = `${getRateLimitKey(request)}:${user.id}`;
    const { success } = await checkInRateLimiter.limit(identifier);
    
    if (!success) {
      return NextResponse.json(
        { error: "Too many check-in attempts. Please try again later." },
        { status: 429 }
      );
    }

    // CSRF protection
    try {
      await requireCsrfToken(request);
    } catch {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 403 }
      );
    }

    // Get daily check-in task
    const dailyTask = await getTaskByName("Daily Check-in");
    if (!dailyTask) {
      return NextResponse.json(
        { error: "Daily check-in task not found" },
        { status: 500 }
      );
    }

    // Complete daily task using new task system
    const result = await completeDailyTask(user.id, dailyTask.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    // Check for weekly challenge completion
    const weeklyCompleted = await checkWeeklyChallenge(user.id);

    // Track daily check-in event
    await trackEvent("daily_checkin", user.id, {
      pointsEarned: dailyTask.points,
      newPointsTotal: result.points,
    });

    return NextResponse.json({
      success: true,
      points: result.points,
      weeklyChallengeCompleted: weeklyCompleted,
    });
  } catch (error: unknown) {
    console.error("Daily check-in error:", error);
    return NextResponse.json(
      { error: "Check-in failed. Please try again." },
      { status: 500 }
    );
  }
}

