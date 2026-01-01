"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithCsrf } from "@/lib/csrf-client";

type TaskCategory = "focus" | "learning" | "output" | "reflection" | "energy" | "system";

interface TaskCardProps {
  id: string;
  name: string;
  type: string;
  points: number;
  isCompleted: boolean;
  isCompletedToday: boolean;
  canComplete: boolean;
  category?: TaskCategory;
  description?: string;
}

const getCategoryStyle = (category: TaskCategory) => {
  const styles: Record<TaskCategory, { bg: string; text: string; border: string; icon: string }> = {
    focus: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200", icon: "text-indigo-500" },
    learning: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", icon: "text-blue-500" },
    output: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", icon: "text-emerald-500" },
    reflection: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", icon: "text-amber-500" },
    energy: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200", icon: "text-rose-500" },
    system: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200", icon: "text-gray-500" },
  };
  return styles[category] || styles.system;
};

const getCategoryIcon = (category: TaskCategory) => {
  switch (category) {
    case "focus":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case "learning":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    case "output":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "reflection":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    case "energy":
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
  }
};

const getCompletedIcon = () => (
  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export default function TaskCard({
  id,
  name,
  type,
  points,
  isCompleted,
  isCompletedToday,
  canComplete,
  category = "system",
  description,
}: TaskCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  
  const categoryStyle = getCategoryStyle(category);
  const isComplete = isCompleted || isCompletedToday;

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
        // Trigger page refresh to update points and momentum
        router.refresh();
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError(data.error || "Failed to log action");
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
        ? "Logged today"
        : "Available"
      : type === "weekly"
      ? "Auto-awarded"
      : isCompleted
      ? "Complete"
      : "Available";

  return (
    <div
      className={`rounded-xl p-4 md:p-5 transition-all duration-300 animate-fade-in border ${
        isComplete 
          ? `${categoryStyle.bg} ${categoryStyle.border} opacity-75` 
          : "bg-white border-gray-100 hover:border-gray-200"
      } ${
        canComplete && !loading
          ? "hover:shadow-md cursor-pointer"
          : ""
      } ${success ? "ring-2 ring-green-500" : ""}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 p-2 rounded-lg ${categoryStyle.bg}`}>
          <div className={isComplete ? "text-green-500" : categoryStyle.icon}>
            {isComplete ? getCompletedIcon() : getCategoryIcon(category)}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium text-sm md:text-base leading-tight ${isComplete ? "text-gray-500" : "text-[#1F2937]"}`}>
            {name}
          </h3>
          {description && (
            <p className="text-xs text-[#6B7280] mt-1 line-clamp-2">
              {description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${categoryStyle.bg} ${categoryStyle.text}`}>
              +{points}
            </span>
            <span className="text-xs text-[#9CA3AF]">{statusText}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg text-green-600 text-xs">
          Action logged. +{points} momentum.
        </div>
      )}

      {type === "daily" && canComplete && (
        <button
          onClick={handleComplete}
          disabled={loading || !canComplete}
          className={`w-full mt-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] ${
            categoryStyle.bg
          } ${categoryStyle.text} hover:opacity-80`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Logging...
            </span>
          ) : (
            "Log this action"
          )}
        </button>
      )}

      {type === "one_time" && canComplete && (
        <button
          onClick={handleComplete}
          disabled={loading || !canComplete}
          className={`w-full mt-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] ${
            categoryStyle.bg
          } ${categoryStyle.text} hover:opacity-80`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Logging...
            </span>
          ) : (
            "Complete setup"
          )}
        </button>
      )}

      {(type === "weekly" || type === "referral") && (
        <div className="mt-3 text-xs text-[#9CA3AF] text-center py-1">
          {type === "weekly"
            ? "Awarded when you log 5+ actions per week"
            : "Awarded when someone joins with your code"}
        </div>
      )}
    </div>
  );
}
