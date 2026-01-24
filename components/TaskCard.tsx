"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, BookOpen, CheckCircle2, Lightbulb, Heart, Settings } from "lucide-react";
import { fetchWithCsrf } from "@/lib/csrf-client";
import Icon from "./ui/Icon";

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
      return Zap;
    case "learning":
      return BookOpen;
    case "output":
      return CheckCircle2;
    case "reflection":
      return Lightbulb;
    case "energy":
      return Heart;
    default:
      return Settings;
  }
};

const getCompletedIcon = () => CheckCircle2;

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
          <div className={isComplete ? "text-success-500" : categoryStyle.icon}>
            <Icon 
              icon={isComplete ? getCompletedIcon() : getCategoryIcon(category)} 
              size="md"
            />
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
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-primary-100 to-purple-100 border border-primary-200">
              <svg className="w-3 h-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-bold text-primary-700">+{points} COROVEL</span>
            </div>
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
        <div className="mt-3 p-3 bg-gradient-to-r from-primary-50 to-purple-50 border-2 border-primary-200 rounded-lg animate-bounce-in">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-success-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <div className="text-sm font-bold text-primary-700">Action logged!</div>
              <div className="text-xs text-primary-600">+{points} Corovel tokens earned</div>
            </div>
          </div>
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
