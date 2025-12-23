/**
 * Analytics tracking utilities
 * Tracks user behavior for validation purposes only
 */
import { prisma } from "./prisma";

export type EventType = "signup" | "login" | "daily_checkin" | "task_completed";

export interface AnalyticsMetadata {
  [key: string]: unknown;
}

/**
 * Track an analytics event
 */
export async function trackEvent(
  eventType: EventType,
  userId?: string | null,
  metadata?: AnalyticsMetadata
): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        userId: userId || null,
        eventType,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    // Don't fail the main operation if analytics fails
    console.error("Analytics tracking error:", error);
  }
}

/**
 * Get total user count
 */
export async function getTotalUsers(): Promise<number> {
  return prisma.user.count();
}

/**
 * Get daily active users (users who logged in or completed a task today)
 */
export async function getDailyActiveUsers(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const activeUserIds = await prisma.analyticsEvent.findMany({
    where: {
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
      eventType: {
        in: ["login", "daily_checkin", "task_completed"],
      },
      userId: {
        not: null,
      },
    },
    select: {
      userId: true,
    },
    distinct: ["userId"],
  });

  return activeUserIds.length;
}

/**
 * Get total tasks completed
 */
export async function getTotalTasksCompleted(): Promise<number> {
  return prisma.userTask.count();
}

/**
 * Get streak continuation count (users who maintained streak today)
 */
export async function getStreakContinuationCount(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Count users who completed daily check-in today
  const dailyTask = await prisma.task.findFirst({
    where: { name: "Daily Check-in" },
  });

  if (!dailyTask) return 0;

  const completions = await prisma.userTask.findMany({
    where: {
      taskId: dailyTask.id,
      completedAt: {
        gte: today,
        lt: tomorrow,
      },
    },
    select: {
      userId: true,
    },
    distinct: ["userId"],
  });

  return completions.length;
}

/**
 * Get analytics summary for admin
 */
export async function getAnalyticsSummary() {
  const [totalUsers, dailyActive, totalTasks, streakCount] = await Promise.all([
    getTotalUsers(),
    getDailyActiveUsers(),
    getTotalTasksCompleted(),
    getStreakContinuationCount(),
  ]);

  return {
    totalUsers,
    dailyActiveUsers: dailyActive,
    totalTasksCompleted: totalTasks,
    streakContinuationCount: streakCount,
  };
}
