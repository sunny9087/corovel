"use client";

import { useEffect, useState } from "react";
import { LeaderboardSkeleton } from "./LoadingSkeleton";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  email: string;
  points: number;
  isCurrentUser?: boolean;
}

interface LeaderboardData {
  entries: LeaderboardEntry[];
  userEntry: LeaderboardEntry | null;
  userRank: number | null;
}

export default function Leaderboard() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/leaderboard");
      if (res.ok) {
        const leaderboardData = await res.json();
        setData(leaderboardData);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LeaderboardSkeleton />;
  }

  if (!data) {
    return null;
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  return (
    <div className="premium-card rounded-xl p-8 animate-fade-in">
      <div className="premium-card-content">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[#1F2937] flex items-center gap-2">
          <svg className="w-5 h-5 text-[#6366F1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
          Leaderboard
        </h2>
        <button
          onClick={fetchLeaderboard}
          className="text-sm text-[#6366F1] hover:text-[#8B5CF6] transition-smooth hover:scale-110 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="space-y-2">
        {data.entries.map((entry, index) => (
          <div
            key={entry.userId}
            className={`stagger-item flex items-center justify-between p-4 rounded-lg transition-all duration-300 hover:scale-[1.02] ${
              entry.isCurrentUser
                ? "bg-gradient-to-r from-[#6366F1]/10 to-[#8B5CF6]/10 border-2 border-[#6366F1] shadow-md"
                : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
            }`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-center gap-3">
              <div className="text-lg font-bold text-[#1F2937] w-8 flex items-center justify-center transition-transform hover:scale-110">
                {getRankIcon(entry.rank)}
              </div>
              <div>
                <div className="text-[#1F2937] font-medium flex items-center gap-2">
                  {entry.email}
                  {entry.isCurrentUser && (
                    <span className="px-2 py-0.5 text-xs text-white bg-[#6366F1] rounded-full">
                      You
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-[#6366F1] transition-transform hover:scale-110">{entry.points.toLocaleString()}</div>
              <div className="text-xs text-[#6B7280]">points</div>
            </div>
          </div>
        ))}

        {data.userEntry && !data.entries.find((e) => e.isCurrentUser) && (
          <>
            <div className="border-t border-[#1F2937] my-2"></div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-[#6366F1]/20 to-[#8B5CF6]/20 border border-[#6366F1]/50">
              <div className="flex items-center gap-3">
                <div className="text-lg font-bold text-[#E5E7EB] w-8">
                  #{data.userEntry.rank}
                </div>
                <div>
                  <div className="text-[#E5E7EB] font-medium">
                    {data.userEntry.email}
                    <span className="ml-2 text-xs text-[#22D3EE]">(You)</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold gradient-text">
                  {data.userEntry.points.toLocaleString()}
                </div>
                <div className="text-xs text-[#9CA3AF]">points</div>
              </div>
            </div>
          </>
        )}
      </div>

      <p className="text-xs text-[#6B7280] mt-6 text-center">
        Top 10 users by total points
      </p>
      </div>
    </div>
  );
}
