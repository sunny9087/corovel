"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithCsrf } from "@/lib/csrf-client";

interface TaskCardProps {
  id: string;
  name: string;
  type: string;
  points: number;
  isCompleted: boolean;
  isCompletedToday: boolean;
  canComplete: boolean;
}

const getTaskIcon = (type: string, isCompleted: boolean) => {
  if (isCompleted) {
    return (
      <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  }

  switch (type) {
    case "daily":
      return (
        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case "one_time":
      return (
        <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    case "weekly":
      return (
        <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      );
    default:
      return (
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      );
  }
};

export default function TaskCard({
  id,
  name,
  type,
  points,
  isCompleted,
  isCompletedToday,
  canComplete,
}: TaskCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleComplete = async () => {
    if (!canComplete) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetchWithCsrf("/api/tasks/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: id }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        // Trigger page refresh to update points and leaderboard
        router.refresh();
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError(data.error || "Failed to complete task");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const statusText =
    type === "daily"
      ? isCompletedToday
        ? "Completed Today"
        : "Available"
      : type === "weekly"
      ? "Auto-Awarded"
      : isCompleted
      ? "Completed"
      : "Available";

  return (
    <div
      className={`premium-card rounded-xl p-6 transition-all duration-300 animate-fade-in bg-white shadow-sm hover:shadow-md ${
        canComplete && !loading
          ? "hover:shadow-lg hover:scale-105 cursor-pointer"
          : "opacity-75"
      } ${success ? "task-complete-animation ring-2 ring-green-500" : ""} ${
        isCompleted || isCompletedToday ? "ring-2 ring-green-200 bg-green-50/30" : ""
      }`}
    >
      <div className="premium-card-content">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`${isCompleted || isCompletedToday ? "text-green-400" : ""}`}>
            {getTaskIcon(type, isCompleted || isCompletedToday)}
          </div>
          <div>
            <h3 className="text-[#1F2937] font-semibold text-lg">{name}</h3>
            <p className="text-[#6B7280] text-sm">{statusText}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold gradient-text">+{points}</div>
          <div className="text-xs text-[#6B7280]">points</div>
        </div>
      </div>

      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
          Task completed! You earned {points} points.
        </div>
      )}

      {type === "daily" && canComplete && (
        <button
          onClick={handleComplete}
          disabled={loading || !canComplete}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : isCompletedToday ? (
              "Already Completed"
            ) : (
              "Complete Task"
            )}
          </span>
          {!loading && (
            <span className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          )}
        </button>
      )}

      {type === "one_time" && canComplete && (
        <button
          onClick={handleComplete}
          disabled={loading || !canComplete}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : isCompleted ? (
              "Already Completed"
            ) : (
              "Complete Task"
            )}
          </span>
          {!loading && (
            <span className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          )}
        </button>
      )}

      {(type === "weekly" || type === "referral") && (
        <div className="text-sm text-[#9CA3AF] text-center py-2">
          {type === "weekly"
            ? "Awarded automatically when you complete 5 daily check-ins in a week"
            : "Awarded automatically when someone signs up with your referral code"}
        </div>
      )}
      </div>
    </div>
  );
}
