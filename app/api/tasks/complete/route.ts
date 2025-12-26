import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import {
  completeDailyTask,
  completeOneTimeTask,
  getTaskById,
  checkWeeklyChallenge,
} from "@/lib/tasks";
import { requireCsrfToken } from "@/lib/csrf";
import { checkInRateLimiter, getRateLimitKey } from "@/lib/rate-limit";
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
        { error: "Too many requests. Please try again later." },
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

    // Parse request body
    const body = await request.json();
    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: "Task ID is required" },
        { status: 400 }
      );
    }

    // Get task
    const task = await getTaskById(taskId);
    if (!task || !task.isActive) {
      return NextResponse.json(
        { error: "Task not found or inactive" },
        { status: 404 }
      );
    }

    // Complete task based on type
    let result;
    if (task.type === "daily") {
      result = await completeDailyTask(user.id, taskId);
      // Check for weekly challenge after daily check-in
      await checkWeeklyChallenge(user.id);
    } else if (task.type === "one_time") {
      result = await completeOneTimeTask(user.id, taskId);
    } else if (task.type === "weekly") {
      // Weekly challenge is auto-awarded, cannot be manually completed
      return NextResponse.json(
        { error: "Weekly challenge is automatically awarded" },
        { status: 400 }
      );
    } else if (task.type === "referral") {
      // Referral tasks are handled during registration
      return NextResponse.json(
        { error: "Referral tasks are automatically completed during sign-up" },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        { error: "Invalid task type" },
        { status: 400 }
      );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    // Track task completion event
    await trackEvent("task_completed", user.id, {
      taskId: task.id,
      taskName: task.name,
      taskType: task.type,
      pointsEarned: task.points,
      newPointsTotal: result.points,
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      points: result.points,
    });
  } catch (error) {
    console.error("Task completion error:", error);
    return NextResponse.json(
      { error: "Failed to complete task. Please try again." },
      { status: 500 }
    );
  }
}
