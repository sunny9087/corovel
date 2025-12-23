import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import {
  getActiveTasks,
  getUserCompletedTasks,
  getUserDailyStreak,
  getWeeklyChallengeProgress,
  checkWeeklyChallenge,
} from "@/lib/tasks";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireAuth();

    // Auto-seed tasks if none exist
    const { initializeTasks } = await import("@/lib/tasks");
    const existingTasks = await getActiveTasks();
    if (existingTasks.length === 0) {
      await initializeTasks();
    }

    // Get all active tasks
    const tasks = await getActiveTasks();

    // Get user's completed tasks
    const completedTasks = await getUserCompletedTasks(user.id);

    // Create a map of completed task IDs for quick lookup
    const completedTaskIds = new Set(
      completedTasks.map((ut) => ut.taskId)
    );

    // Check daily completion status for daily tasks
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check which daily tasks are completed today
    const todayCompletedTasks = new Set<string>();
    for (const completedTask of completedTasks) {
      const task = tasks.find((t) => t.id === completedTask.taskId);
      if (task && task.type === "daily") {
        const completedAt = new Date(completedTask.completedAt);
        if (completedAt >= today && completedAt < tomorrow) {
          todayCompletedTasks.add(task.id);
        }
      }
    }

    // Get streak and weekly progress
    const streak = await getUserDailyStreak(user.id);
    const weeklyProgress = await getWeeklyChallengeProgress(user.id);

    // Check for weekly challenge completion (may have just been triggered)
    await checkWeeklyChallenge(user.id);

    // Enrich tasks with completion status
    const enrichedTasks = tasks.map((task) => {
      const isCompleted = completedTaskIds.has(task.id);
      const isCompletedToday = todayCompletedTasks.has(task.id);
      const canComplete =
        task.type === "daily"
          ? !isCompletedToday
          : task.type === "one_time"
          ? !isCompleted
          : task.type === "weekly"
          ? false // Auto-awarded
          : false; // referral is auto-awarded

      return {
        ...task,
        isCompleted,
        isCompletedToday,
        canComplete,
      };
    });

    return NextResponse.json({
      tasks: enrichedTasks,
      streak,
      weeklyProgress,
      userPoints: user.points,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}
