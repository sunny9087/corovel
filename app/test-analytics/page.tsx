import { prisma } from "@/lib/prisma";
import { getAnalyticsSummary } from "@/lib/analytics";

export default async function TestAnalyticsPage() {
  try {
    // Test database connection
    const userCount = await prisma.user.count();
    
    // Test analytics
    const summary = await getAnalyticsSummary();
    
    // Test analytics event creation
    await prisma.analyticsEvent.create({
      data: {
        eventType: "test",
        metadata: JSON.stringify({ test: true }),
      },
    });

    return (
      <div className="min-h-screen bg-[#0B0F1A] p-8">
        <div className="max-w-2xl mx-auto bg-[#111827] rounded-xl p-6 border border-[#1F2937]">
          <h1 className="text-2xl font-bold text-[#E5E7EB] mb-4">Analytics Test</h1>
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-400 font-medium">✅ All tests passed!</p>
            </div>
            <div className="space-y-2 text-[#E5E7EB]">
              <p><strong>User Count:</strong> {userCount}</p>
              <p><strong>Total Users (Analytics):</strong> {summary.totalUsers}</p>
              <p><strong>Daily Active:</strong> {summary.dailyActiveUsers}</p>
              <p><strong>Total Tasks Completed:</strong> {summary.totalTasksCompleted}</p>
              <p><strong>Streak Continuation:</strong> {summary.streakContinuationCount}</p>
            </div>
            <div className="mt-4">
              <a
                href="/dashboard"
                className="inline-block px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#8B5CF6] transition-smooth"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] p-8">
        <div className="max-w-2xl mx-auto bg-[#111827] rounded-xl p-6 border border-red-500/30">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 font-medium">❌ Error occurred:</p>
            <pre className="mt-2 text-sm text-[#E5E7EB] whitespace-pre-wrap">
              {error instanceof Error ? error.message : String(error)}
            </pre>
            {error instanceof Error && error.stack && (
              <details className="mt-4">
                <summary className="text-sm text-[#9CA3AF] cursor-pointer">Stack trace</summary>
                <pre className="mt-2 text-xs text-[#9CA3AF] whitespace-pre-wrap">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>
    );
  }
}
