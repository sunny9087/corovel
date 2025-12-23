/**
 * Leaderboard utilities
 */
import { prisma } from "./prisma";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  email: string;
  points: number;
  isCurrentUser?: boolean;
}

/**
 * Get top users by points (for current week)
 */
export async function getTopUsers(limit = 10, currentUserId?: string): Promise<LeaderboardEntry[]> {
  // Get start of current week (Monday)
  const now = new Date();
  const weekStart = new Date(now);
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  weekStart.setDate(now.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);

  // Get users with their current points
  // Note: For weekly leaderboard, we could track weekly points separately
  // For now, we'll use total points (can be enhanced later)
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      points: true,
    },
    orderBy: {
      points: "desc",
    },
    take: limit,
  });

  return users.map((user, index) => ({
    rank: index + 1,
    userId: user.id,
    email: maskEmail(user.email),
    points: user.points,
    isCurrentUser: currentUserId === user.id,
  }));
}

/**
 * Get user's rank in leaderboard
 */
export async function getUserRank(userId: string): Promise<number | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { points: true },
  });

  if (!user) return null;

  const usersAhead = await prisma.user.count({
    where: {
      points: {
        gt: user.points,
      },
    },
  });

  return usersAhead + 1;
}

/**
 * Check if user is in top 20%
 */
export async function isUserInTopPercentile(userId: string, percentile = 20): Promise<boolean> {
  const totalUsers = await prisma.user.count();
  if (totalUsers === 0) return false;

  const userRank = await getUserRank(userId);
  if (!userRank) return false;

  const topPercentileThreshold = Math.ceil(totalUsers * (percentile / 100));
  return userRank <= topPercentileThreshold;
}

/**
 * Mask email for privacy (show first 2 chars and domain)
 */
function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");
  if (!domain) return email;

  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`;
  }

  return `${localPart.substring(0, 2)}***@${domain}`;
}

/**
 * Get leaderboard with current user included if not in top 10
 */
export async function getLeaderboardWithUser(
  currentUserId: string,
  limit = 10
): Promise<{
  entries: LeaderboardEntry[];
  userEntry: LeaderboardEntry | null;
  userRank: number | null;
}> {
  const topUsers = await getTopUsers(limit, currentUserId);
  const userRank = await getUserRank(currentUserId);

  // Check if current user is already in top list
  const userInList = topUsers.find((entry) => entry.isCurrentUser);

  let userEntry: LeaderboardEntry | null = null;

  if (!userInList && userRank) {
    // Get user's entry
    const user = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: {
        id: true,
        email: true,
        points: true,
      },
    });

    if (user) {
      userEntry = {
        rank: userRank,
        userId: user.id,
        email: maskEmail(user.email),
        points: user.points,
        isCurrentUser: true,
      };
    }
  }

  return {
    entries: topUsers,
    userEntry,
    userRank,
  };
}
