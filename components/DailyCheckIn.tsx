"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithCsrf } from "@/lib/csrf-client";

export default function DailyCheckIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleCheckIn = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetchWithCsrf("/api/tasks/daily-checkin", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || "Check-in failed");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-4 md:mb-6">
      <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4">
        Daily Log
      </h2>
      <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
        Log your daily action to track momentum.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 md:px-4 py-2.5 md:py-3 rounded mb-3 md:mb-4 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-3 md:px-4 py-2.5 md:py-3 rounded mb-3 md:mb-4 text-sm">
          Logged. Progress updated.
        </div>
      )}

      <button
        onClick={handleCheckIn}
        disabled={loading}
        className="px-4 md:px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium min-h-[44px] text-sm md:text-base"
      >
        {loading ? "Logging..." : "Log Today"}
      </button>
    </div>
  );
}

