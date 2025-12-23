"use client";

import { useEffect, useState } from "react";

interface RetentionHooksProps {
  streak: number;
  hasCheckedInToday: boolean;
  userRank: number | null;
  totalUsers: number;
  pointsIncrease?: number;
}

export default function RetentionHooks({
  streak,
  hasCheckedInToday,
  userRank,
  totalUsers,
  pointsIncrease,
}: RetentionHooksProps) {
  const [showStreakWarning, setShowStreakWarning] = useState(false);
  const [showSocialMotivation, setShowSocialMotivation] = useState(false);
  const [showPointsFeedback, setShowPointsFeedback] = useState(false);

  useEffect(() => {
    // Streak warning - show if user has streak but hasn't checked in today
    if (streak > 0 && !hasCheckedInToday) {
      setShowStreakWarning(true);
    }

    // Social motivation - show if user is in top 20%
    if (userRank && totalUsers > 0) {
      const topPercentileThreshold = Math.ceil(totalUsers * 0.2);
      if (userRank <= topPercentileThreshold) {
        setShowSocialMotivation(true);
      }
    }
  }, [streak, hasCheckedInToday, userRank, totalUsers]);

  useEffect(() => {
    // Points feedback - show when points increase
    if (pointsIncrease && pointsIncrease > 0) {
      setShowPointsFeedback(true);
      const timer = setTimeout(() => {
        setShowPointsFeedback(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [pointsIncrease]);

  if (!showStreakWarning && !showSocialMotivation && !showPointsFeedback) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {/* Streak Warning */}
      {showStreakWarning && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="animate-float">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-[#1F2937] font-medium">Don&apos;t lose your streak today!</p>
              <p className="text-sm text-[#6B7280]">Complete your daily check-in to maintain your {streak}-day streak</p>
            </div>
          </div>
          <button
            onClick={() => setShowStreakWarning(false)}
            className="text-[#6B7280] hover:text-[#1F2937] transition-smooth hover:scale-110"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Social Motivation */}
      {showSocialMotivation && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3 animate-slide-up">
          <div className="animate-float">
            <svg className="w-5 h-5 text-[#6366F1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className="text-[#1F2937] font-medium">You&apos;re ahead of most users today!</p>
            <p className="text-sm text-[#6B7280]">Keep up the great work</p>
          </div>
        </div>
      )}

      {/* Points Feedback */}
      {showPointsFeedback && pointsIncrease && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 animate-bounce-in">
          <div className="flex items-center gap-3">
            <div className="animate-float">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <p className="text-[#1F2937] font-medium text-lg">
                +{pointsIncrease} points added!
              </p>
              <p className="text-sm text-[#6B7280]">Great job completing your task</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
