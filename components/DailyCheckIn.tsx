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
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Daily Check-in
      </h2>
      <p className="text-gray-600 mb-4">
        Complete your daily check-in to earn <strong>5 points</strong>. You can check in once per day.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          Successfully checked in! You earned 5 points.
        </div>
      )}

      <button
        onClick={handleCheckIn}
        disabled={loading}
        className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {loading ? "Processing..." : "Daily Check-in (+5 points)"}
      </button>
    </div>
  );
}

