/**
 * Task system utilities
 */
import { prisma } from "./prisma";
import { addPointTransaction } from "./auth";

export type TaskType = "daily" | "one_time" | "referral" | "weekly";

export interface TaskData {
  name: string;
  type: TaskType;
  points: number;
  isActive?: boolean;
}

/**
 * Initialize default tasks in the database
 */
export async function initializeTasks() {
  const defaultTasks: TaskData[] = [
    {
      name: "Daily Check-in",
      type: "daily",
      points: 5,
      isActive: true,
    },
    {
      name: "Referral Sign-up",
      type: "referral",
      points: 10,
      isActive: true,
    },
    {
      name: "Profile Completion",
      type: "one_time",
      points: 5,
      isActive: true,
    },
    {
      name: "Weekly Challenge",
      type: "weekly",
      points: 20,
      isActive: true,
    },
  ];

  for (const taskData of defaultTasks) {
    const existing = await prisma.task.findFirst({
      where: { name: taskData.name },
    });

    if (!existing) {
      await prisma.task.create({
        data: taskData,
      });
    }
  }
}

/**
 * Get all active tasks
 */
export async function getActiveTasks() {
  return prisma.task.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}

/**
 * Get task by ID
 */
export async function getTaskById(taskId: string) {
  return prisma.task.findUnique({
    where: { id: taskId },
  });
}

/**
 * Get task by name
 */
export async function getTaskByName(name: string) {
  return prisma.task.findFirst({
    where: { name },
  });
}

/**
 * Check if user has completed a task
 */
export async function hasUserCompletedTask(
  userId: string,
  taskId: string
): Promise<boolean> {
  const userTask = await prisma.userTask.findUnique({
    where: {
      userId_taskId: {
        userId,
        taskId,
      },
    },
  });
  return !!userTask;
}

/**
 * Get user's completed tasks
 */
export async function getUserCompletedTasks(userId: string) {
  return prisma.userTask.findMany({
    where: { userId },
    include: { task: true },
    orderBy: { completedAt: "desc" },
  });
}

/**
 * Complete a daily task (checks if already completed today)
 */
export async function completeDailyTask(
  userId: string,
  taskId: string
): Promise<{ success: boolean; message: string; points?: number }> {
  const task = await getTaskById(taskId);
  if (!task || task.type !== "daily") {
    return { success: false, message: "Invalid task" };
  }

  // Check if already completed today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existing = await prisma.userTask.findFirst({
    where: {
      userId,
      taskId,
      completedAt: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  if (existing) {
    return { success: false, message: "Task already completed today" };
  }

  // Complete task and award points
  // For daily tasks, we need to handle the unique constraint while preserving streak history
  // Strategy: Check if already completed today, then use upsert to update existing record if needed
  const result = await prisma.$transaction(async (tx) => {
    // Double-check: get the most recent completion to see if it's from today
    const mostRecent = await tx.userTask.findFirst({
      where: {
        userId,
        taskId,
      },
      orderBy: { completedAt: "desc" },
    });

    if (mostRecent) {
      const mostRecentDate = new Date(mostRecent.completedAt);
      mostRecentDate.setHours(0, 0, 0, 0);
      
      if (mostRecentDate.getTime() === today.getTime()) {
        // Already completed today
        throw new Error("ALREADY_COMPLETED_TODAY");
      }
    }

    // For daily tasks with unique constraint, we need to handle this specially
    // Since there's a unique constraint on (userId, taskId), we can only have one record
    // We'll delete any old record and create a new one for today
    // Note: This limits streak calculation to the most recent completion date
    // To properly track streaks, we'd need to remove the unique constraint or use a different approach
    
    // Delete any existing record (there can only be one due to unique constraint)
    await tx.userTask.deleteMany({
      where: {
        userId,
        taskId,
      },
    });

    // Create new user task record for today
    await tx.userTask.create({
      data: {
        userId,
        taskId,
        // completedAt will be set to now() by default
      },
    });

    // Award points
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        points: {
          increment: task.points,
        },
      },
      select: { points: true },
    });

    return updatedUser.points;
  }).catch((error) => {
    // Handle specific errors
    if (error.message === "ALREADY_COMPLETED_TODAY") {
      return { error: "ALREADY_COMPLETED" };
    }
    // Handle unique constraint violation (race condition)
    if (error.code === "P2002") {
      return { error: "ALREADY_COMPLETED" };
    }
    throw error;
  });

  // Check if transaction returned an error
  if (typeof result === "object" && "error" in result) {
    return { success: false, message: "Task already completed today" };
  }

  // Record transaction
  await addPointTransaction(
    userId,
    task.points,
    "daily_checkin",
    `Completed: ${task.name}`
  );

  return {
    success: true,
    message: `Task completed! You earned ${task.points} points.`,
    points: result as number,
  };
}

/**
 * Complete a one-time task
 */
export async function completeOneTimeTask(
  userId: string,
  taskId: string
): Promise<{ success: boolean; message: string; points?: number }> {
  const task = await getTaskById(taskId);
  if (!task || task.type !== "one_time") {
    return { success: false, message: "Invalid task" };
  }

  // Check if already completed
  const hasCompleted = await hasUserCompletedTask(userId, taskId);
  if (hasCompleted) {
    return { success: false, message: "Task already completed" };
  }

  // Complete task and award points
  // Use upsert pattern to handle unique constraint gracefully
  const result = await prisma.$transaction(async (tx) => {
    // Check if record exists (double-check for race condition)
    const existing = await tx.userTask.findUnique({
      where: {
        userId_taskId: {
          userId,
          taskId,
        },
      },
    });

    if (existing) {
      throw new Error("ALREADY_COMPLETED");
    }

    // Create new record
    await tx.userTask.create({
      data: {
        userId,
        taskId,
      },
    });

    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        points: {
          increment: task.points,
        },
      },
      select: { points: true },
    });

    return updatedUser.points;
  }).catch((error) => {
    // Handle unique constraint violation gracefully
    if (error.code === "P2002" || error.message === "ALREADY_COMPLETED") {
      return { error: "ALREADY_COMPLETED" };
    }
    throw error;
  });

  if (typeof result === "object" && "error" in result) {
    return { success: false, message: "Task already completed" };
  }

  // Record transaction
  await addPointTransaction(
    userId,
    task.points,
    "profile_completion",
    `Completed: ${task.name}`
  );

  return {
    success: true,
    message: `Task completed! You earned ${task.points} points.`,
    points: result as number,
  };
}

/**
 * Complete referral task (called when user signs up with referral)
 */
export async function completeReferralTask(
  userId: string,
  referrerUserId: string
): Promise<void> {
  const task = await getTaskByName("Referral Sign-up");
  if (!task) return;

  // Complete for new user (they get points in createUser, but track task completion)
  const hasCompleted = await hasUserCompletedTask(userId, task.id);
  if (!hasCompleted) {
    await prisma.userTask.create({
      data: {
        userId,
        taskId: task.id,
      },
    });
  }

  // Complete for referrer (they get points in createUser, but track task completion)
  // Note: Referral task can be completed multiple times (once per referral)
  // So we create a new UserTask record for each referral
  await prisma.userTask.create({
    data: {
      userId: referrerUserId,
      taskId: task.id,
    },
  });
}

/**
 * Check and award weekly challenge
 */
export async function checkWeeklyChallenge(userId: string): Promise<boolean> {
  const task = await getTaskByName("Weekly Challenge");
  if (!task) return false;

  // Get start of current week (Monday)
  const now = new Date();
  const weekStart = new Date(now);
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday = 0
  weekStart.setDate(now.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);

  // Check if already completed this week
  const hasCompleted = await hasUserCompletedTask(userId, task.id);
  if (hasCompleted) {
    const completion = await prisma.userTask.findUnique({
      where: {
        userId_taskId: {
          userId,
          taskId: task.id,
        },
      },
    });

    if (completion) {
      const completedDate = new Date(completion.completedAt);
      completedDate.setHours(0, 0, 0, 0);

      if (completedDate >= weekStart) {
        return false; // Already completed this week
      }
    }
  }

  // Count daily check-ins this week
  const dailyTask = await getTaskByName("Daily Check-in");
  if (!dailyTask) return false;

  const dailyCheckIns = await prisma.userTask.count({
    where: {
      userId,
      taskId: dailyTask.id,
      completedAt: {
        gte: weekStart,
      },
    },
  });

  // Award if 5 or more check-ins
  if (dailyCheckIns >= 5) {
    // Delete old completion if exists (for new week)
    if (hasCompleted) {
      await prisma.userTask.deleteMany({
        where: {
          userId,
          taskId: task.id,
        },
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.userTask.create({
        data: {
          userId,
          taskId: task.id,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          points: {
            increment: task.points,
          },
        },
      });
    });

    await addPointTransaction(
      userId,
      task.points,
      "weekly_challenge",
      `Completed: ${task.name}`
    );

    return true;
  }

  return false;
}

/**
 * Get user's daily streak count
 * Since UserTask has unique constraint on (userId, taskId), we use point transactions
 * to track completion history for accurate streak calculation.
 */
export async function getUserDailyStreak(userId: string): Promise<number> {
  // Get point transactions for daily check-ins to count consecutive days
  // Look back up to 365 days to find the streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lookbackStart = new Date(today);
  lookbackStart.setDate(lookbackStart.getDate() - 365);
  
  const transactions = await prisma.pointTransaction.findMany({
    where: {
      userId,
      type: "daily_checkin",
      createdAt: {
        gte: lookbackStart,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (transactions.length === 0) return 0;

  // Create a set of dates when task was completed (based on transactions)
  const completionDates = new Set<string>();
  for (const tx of transactions) {
    const txDate = new Date(tx.createdAt);
    txDate.setHours(0, 0, 0, 0);
    completionDates.add(txDate.toISOString().split('T')[0]);
  }

  // Count consecutive days with completions
  // Start from today (or yesterday if today hasn't been completed yet)
  let streak = 0;
  let daysOffset = 0; // 0 = today, 1 = yesterday, etc.
  
  // Check if today has a completion
  const todayStr = today.toISOString().split('T')[0];
  if (!completionDates.has(todayStr)) {
    // Today not completed, start counting from yesterday
    daysOffset = 1;
  }

  // Count consecutive days backwards
  while (true) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - daysOffset);
    const dateStr = checkDate.toISOString().split('T')[0];
    
    if (completionDates.has(dateStr)) {
      streak++;
      daysOffset++;
    } else {
      // Gap found, streak is broken
      break;
    }

    // Safety check to prevent infinite loop
    if (daysOffset > 365) break; // Limit to 1 year
  }

  return streak;
}

/**
 * Get weekly challenge progress
 * Since UserTask has unique constraint, we use point transactions to count completions
 */
export async function getWeeklyChallengeProgress(
  userId: string
): Promise<{ current: number; target: number }> {
  // Get start of current week (Monday)
  const now = new Date();
  const weekStart = new Date(now);
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday = 0
  weekStart.setDate(now.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);

  // Count unique days with daily check-ins this week using point transactions
  const transactions = await prisma.pointTransaction.findMany({
    where: {
      userId,
      type: "daily_checkin",
      createdAt: {
        gte: weekStart,
      },
    },
  });

  // Count unique days (one completion per day)
  const uniqueDays = new Set<string>();
  for (const tx of transactions) {
    const txDate = new Date(tx.createdAt);
    txDate.setHours(0, 0, 0, 0);
    uniqueDays.add(txDate.toISOString().split('T')[0]);
  }

  return { current: uniqueDays.size, target: 7 };
}
