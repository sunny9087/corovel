/**
 * Leaderboard utilities (retired)
 *
 * Corovel's Progress is personal-only and must not encourage comparison.
 * These helpers remain only for compatibility, but they no longer query or
 * rank other users.
 */

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  email: string;
  points: number;
  isCurrentUser?: boolean;
}

/**
 * Retired: previously returned ranked users.
 */
export async function getTopUsers(limit = 10, currentUserId?: string): Promise<LeaderboardEntry[]> {
  void limit;
  void currentUserId;
  return [];
}

/**
 * Retired: previously calculated a user's position.
 */
export async function getUserRank(userId: string): Promise<number | null> {
  void userId;
  return null;
}

/**
 * Retired: previously computed percentile placement.
 */
export async function isUserInTopPercentile(userId: string, percentile = 20): Promise<boolean> {
  void userId;
  void percentile;
  return false;
}

/**
 * Retired: previously returned a ranked list plus a user entry.
 */
export async function getLeaderboardWithUser(
  currentUserId: string,
  limit = 10
): Promise<{
  entries: LeaderboardEntry[];
  userEntry: LeaderboardEntry | null;
  userRank: number | null;
}> {
  void currentUserId;
  void limit;
  return {
    entries: [],
    userEntry: null,
    userRank: null,
  };
}
