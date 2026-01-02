"use client";

import { useEffect, useState } from "react";

interface RetentionHooksProps {
  streak: number;
  hasCheckedInToday: boolean;
  pointsIncrease?: number;
}

export default function RetentionHooks({
  streak,
  hasCheckedInToday,
  pointsIncrease,
}: RetentionHooksProps) {
  const [showStreakWarning, setShowStreakWarning] = useState(false);
  const [showPointsFeedback, setShowPointsFeedback] = useState(false);

  useEffect(() => {
    // Streak warning - show if user has streak but hasn't checked in today
    if (streak > 0 && !hasCheckedInToday) {
      setShowStreakWarning(true);
    }
  }, [streak, hasCheckedInToday]);

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

  if (!showStreakWarning && !showPointsFeedback) {
    return null;
  }

  return (
    <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
      {/* Streak Warning */}
      {showStreakWarning && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3 md:p-4 flex items-center justify-between animate-slide-up">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="animate-float">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-[#1F2937] font-medium text-sm md:text-base">Keep your momentum going</p>
              <p className="text-xs md:text-sm text-[#6B7280]">Log an action today to continue your {streak}-day progress</p>
            </div>
          </div>
          <button
            onClick={() => setShowStreakWarning(false)}
            className="text-[#6B7280] hover:text-[#1F2937] transition-smooth hover:scale-110 p-1"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Points Feedback */}
      {showPointsFeedback && pointsIncrease && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 md:p-4 animate-bounce-in">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="animate-float">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <p className="text-[#1F2937] font-medium text-base md:text-lg">
                +{pointsIncrease} logged
              </p>
              <p className="text-xs md:text-sm text-[#6B7280]">Action logged</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
