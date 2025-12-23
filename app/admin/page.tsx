import { requireAuth } from "@/lib/auth-utils";
import { getAnalyticsSummary } from "@/lib/analytics";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

// Simple admin check - in production, use proper role-based access
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(",") || [];

export default async function AdminPage() {
  const user = await requireAuth();

  // Check if user is admin (simple check - enhance in production)
  if (ADMIN_EMAILS.length > 0 && !ADMIN_EMAILS.includes(user.email)) {
    redirect("/dashboard");
  }

  const analytics = await getAnalyticsSummary();

  return (
    <div className="min-h-screen bg-[#0B0F1A]">
      {/* Header */}
      <header className="border-b border-[#1F2937] bg-[#111827]/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold gradient-text">Admin Dashboard</h1>
              <p className="text-sm text-[#9CA3AF] mt-1">Analytics & Insights</p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/dashboard"
                className="px-4 py-2 bg-[#1F2937] border border-[#374151] text-[#E5E7EB] rounded-lg hover:bg-[#374151] transition-smooth text-sm"
              >
                Back to Dashboard
              </a>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-[#111827] rounded-xl p-6 border border-[#1F2937]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-[#9CA3AF]">Total Users</h3>
              <svg className="w-5 h-5 text-[#6366F1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-[#E5E7EB]">{analytics.totalUsers}</div>
          </div>

          {/* Daily Active Users */}
          <div className="bg-[#111827] rounded-xl p-6 border border-[#1F2937]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-[#9CA3AF]">Daily Active Users</h3>
              <svg className="w-5 h-5 text-[#22D3EE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-[#E5E7EB]">{analytics.dailyActiveUsers}</div>
            <p className="text-xs text-[#9CA3AF] mt-1">Today</p>
          </div>

          {/* Total Tasks Completed */}
          <div className="bg-[#111827] rounded-xl p-6 border border-[#1F2937]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-[#9CA3AF]">Tasks Completed</h3>
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-[#E5E7EB]">{analytics.totalTasksCompleted}</div>
            <p className="text-xs text-[#9CA3AF] mt-1">All time</p>
          </div>

          {/* Streak Continuation */}
          <div className="bg-[#111827] rounded-xl p-6 border border-[#1F2937]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-[#9CA3AF]">Streak Continuation</h3>
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-[#E5E7EB]">{analytics.streakContinuationCount}</div>
            <p className="text-xs text-[#9CA3AF] mt-1">Maintained today</p>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-[#111827] rounded-xl p-6 border border-[#1F2937]">
          <h2 className="text-xl font-semibold text-[#E5E7EB] mb-4">About Analytics</h2>
          <p className="text-sm text-[#9CA3AF] leading-relaxed">
            This analytics dashboard tracks user behavior for validation purposes only. 
            All data is stored internally and used to improve the user experience. 
            No personal data is shared with third parties.
          </p>
        </div>
      </main>
    </div>
  );
}
