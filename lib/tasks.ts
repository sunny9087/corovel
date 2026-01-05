/**
 * Task system utilities
 * 
 * Task Categories:
 * - focus: Focus & Direction - Setting intentions and priorities
 * - learning: Learning & Skill - Knowledge acquisition and skill building
 * - output: Output & Creation - Shipping and creating tangible work
 * - reflection: Reflection & Review - Processing and synthesizing progress
 * - energy: Health & Energy - Physical foundation (minimal, optional)
 */
import { prisma } from "./prisma";
import { addPointTransaction } from "./auth";

export type TaskType = "daily" | "one_time" | "referral" | "weekly";
export type TaskCategory = "focus" | "learning" | "output" | "reflection" | "energy" | "system";

export interface TaskData {
  name: string;
  type: TaskType;
  points: number;
  isActive?: boolean;
  category?: TaskCategory;
  description?: string;
}

// Task category metadata for UI display
export const TASK_CATEGORIES: Record<TaskCategory, { label: string; description: string; color: string }> = {
  focus: {
    label: "Focus & Direction",
    description: "Set intentions and clarify priorities",
    color: "indigo",
  },
  learning: {
    label: "Learning & Skill",
    description: "Build knowledge and develop abilities",
    color: "blue",
  },
  output: {
    label: "Output & Creation",
    description: "Ship work and create tangible progress",
    color: "emerald",
  },
  reflection: {
    label: "Reflection & Review",
    description: "Process what happened and extract signal",
    color: "amber",
  },
  energy: {
    label: "Health & Energy",
    description: "Maintain the foundation",
    color: "rose",
  },
  system: {
    label: "System",
    description: "Platform actions",
    color: "gray",
  },
};

// Default tasks organized by category
export const DEFAULT_TASKS: TaskData[] = [
  // Focus & Direction
  {
    name: "Define today's primary focus",
    type: "daily",
    points: 10,
    isActive: true,
    category: "focus",
    description: "Identify the one thing that would make today meaningful",
  },
  {
    name: "Set a clear outcome for the week",
    type: "daily",
    points: 8,
    isActive: true,
    category: "focus",
    description: "What does success look like by end of week?",
  },
  {
    name: "Remove one distraction",
    type: "daily",
    points: 6,
    isActive: true,
    category: "focus",
    description: "Eliminate something that pulls your attention away",
  },
  {
    name: "Say no to one thing",
    type: "daily",
    points: 5,
    isActive: true,
    category: "focus",
    description: "Protect your time by declining a request or commitment",
  },

  // Learning & Skill
  {
    name: "Spend 30 minutes learning something specific",
    type: "daily",
    points: 12,
    isActive: true,
    category: "learning",
    description: "Focused learning on a skill or topic you're developing",
  },
  {
    name: "Read one article or chapter deeply",
    type: "daily",
    points: 8,
    isActive: true,
    category: "learning",
    description: "Quality over quantity—understand, don't skim",
  },
  {
    name: "Watch one educational video with notes",
    type: "daily",
    points: 6,
    isActive: true,
    category: "learning",
    description: "Active viewing with capture, not passive consumption",
  },
  {
    name: "Practice a skill for 15 minutes",
    type: "daily",
    points: 8,
    isActive: true,
    category: "learning",
    description: "Deliberate practice on something you're improving",
  },

  // Output & Creation
  {
    name: "Ship one small thing",
    type: "daily",
    points: 15,
    isActive: true,
    category: "output",
    description: "Complete and deliver something—size doesn't matter",
  },
  {
    name: "Write 200 words of original content",
    type: "daily",
    points: 10,
    isActive: true,
    category: "output",
    description: "Document, draft, or express an idea in writing",
  },
  {
    name: "Make one decision you've been avoiding",
    type: "daily",
    points: 8,
    isActive: true,
    category: "output",
    description: "Clear the queue—decide and move on",
  },
  {
    name: "Finish one task from your backlog",
    type: "daily",
    points: 10,
    isActive: true,
    category: "output",
    description: "Complete something that's been lingering",
  },
  {
    name: "Send one important message",
    type: "daily",
    points: 5,
    isActive: true,
    category: "output",
    description: "Communication that moves something forward",
  },

  // Reflection & Review
  {
    name: "Review what moved forward today",
    type: "daily",
    points: 8,
    isActive: true,
    category: "reflection",
    description: "Identify actual progress made",
  },
  {
    name: "Note one thing you learned today",
    type: "daily",
    points: 5,
    isActive: true,
    category: "reflection",
    description: "Capture insight before it fades",
  },
  {
    name: "Identify what blocked you",
    type: "daily",
    points: 6,
    isActive: true,
    category: "reflection",
    description: "Name the friction so you can address it",
  },
  {
    name: "Plan tomorrow's first action",
    type: "daily",
    points: 5,
    isActive: true,
    category: "reflection",
    description: "Remove decision friction for tomorrow morning",
  },

  // Health & Energy (minimal)
  {
    name: "Move your body for 20 minutes",
    type: "daily",
    points: 6,
    isActive: true,
    category: "energy",
    description: "Physical activity to maintain baseline energy",
  },
  {
    name: "Take a real break",
    type: "daily",
    points: 4,
    isActive: true,
    category: "energy",
    description: "Step away from screens for 15+ minutes",
  },

  // System tasks (existing functionality)
  {
    name: "Invite someone to Corovel",
    type: "referral",
    points: 25,
    isActive: true,
    category: "system",
    description: "Share your invite code with someone who would benefit",
  },
  {
    name: "Complete your profile",
    type: "one_time",
    points: 15,
    isActive: true,
    category: "system",
    description: "Set up your account details",
  },
  {
    name: "Weekly momentum bonus",
    type: "weekly",
    points: 30,
    isActive: true,
    category: "system",
    description: "Awarded for logging 5+ actions in a week",
  },
];

/**
 * Initialize default tasks in the database
 * Uses upsert to update existing tasks and add new ones
 */
export async function initializeTasks() {
  for (const taskData of DEFAULT_TASKS) {
    // Try to find existing task by name
    const existing = await prisma.task.findFirst({
      where: { name: taskData.name },
    });

    if (existing) {
      // Update existing task with new data (preserves ID for user completions)
      await prisma.task.update({
        where: { id: existing.id },
        data: {
          type: taskData.type,
          points: taskData.points,
          isActive: taskData.isActive ?? true,
        },
      });
    } else {
      // Create new task
      await prisma.task.create({
        data: {
          name: taskData.name,
          type: taskData.type,
          points: taskData.points,
          isActive: taskData.isActive ?? true,
        },
      });
    }
  }
  
  // Deactivate old tasks that are no longer in DEFAULT_TASKS
  const defaultTaskNames = DEFAULT_TASKS.map(t => t.name);
  await prisma.task.updateMany({
    where: {
      name: {
        notIn: defaultTaskNames,
      },
    },
    data: {
      isActive: false,
    },
  });
}

/**
 * Get task category from task name (derived from DEFAULT_TASKS)
 */
export function getTaskCategory(taskName: string): TaskCategory {
  const task = DEFAULT_TASKS.find(t => t.name === taskName);
  return task?.category ?? "system";
}

/**
 * Get task description from task name (derived from DEFAULT_TASKS)
 */
export function getTaskDescription(taskName: string): string | undefined {
  const task = DEFAULT_TASKS.find(t => t.name === taskName);
  return task?.description;
}

/**
 * Get tasks grouped by category
 */
export function getTasksByCategory(): Record<TaskCategory, TaskData[]> {
  const grouped: Record<TaskCategory, TaskData[]> = {
    focus: [],
    learning: [],
    output: [],
    reflection: [],
    energy: [],
    system: [],
  };
  
  for (const task of DEFAULT_TASKS) {
    const category = task.category ?? "system";
    grouped[category].push(task);
  }
  
  return grouped;
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
  const task = await getTaskByName("Invite someone to Corovel");
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
  // Note: The current schema enforces @@unique([userId, taskId]), so this must be idempotent.
  const referrerHasCompleted = await hasUserCompletedTask(referrerUserId, task.id);
  if (!referrerHasCompleted) {
    await prisma.userTask.create({
      data: {
        userId: referrerUserId,
        taskId: task.id,
      },
    });
  }
}

/**
 * Check and award weekly momentum bonus
 */
export async function checkWeeklyChallenge(userId: string): Promise<boolean> {
  const task = await getTaskByName("Weekly momentum bonus");
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

  // Count daily action completions this week (any daily task)
  const dailyActionCount = await prisma.pointTransaction.count({
    where: {
      userId,
      type: "daily_checkin",
      createdAt: {
        gte: weekStart,
      },
    },
  });

  // Award if 5 or more daily actions logged
  if (dailyActionCount >= 5) {
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
