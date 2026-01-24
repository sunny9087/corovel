import { requireAuth } from "@/lib/auth-utils";
import { getActiveTasks, DEFAULT_TASKS, TaskCategory } from "@/lib/tasks";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import HeaderLogoutButton from "@/components/HeaderLogoutButton";
import CorovelTokenBadge from "@/components/CorovelTokenBadge";
import AnimatedBackground from "@/components/AnimatedBackground";
import GradientMesh from "@/components/GradientMesh";
import ParticleField from "@/components/ParticleField";
import AnimatedShapes from "@/components/AnimatedShapes";
import { Coins } from "lucide-react";
import Icon from "@/components/ui/Icon";

export const dynamic = "force-dynamic";

type Trend = "increasing" | "stable" | "declining";

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgo(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function formatSignedPercent(value: number): string {
  const pct = Math.round(value * 100);
  return `${pct >= 0 ? "+" : ""}${pct}%`;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function computeTrend(current: number, previous: number): { trend: Trend; deltaRatio: number } {
  const denom = Math.max(1, previous);
  const deltaRatio = (current - previous) / denom;
  if (deltaRatio > 0.15) return { trend: "increasing", deltaRatio };
  if (deltaRatio < -0.15) return { trend: "declining", deltaRatio };
  return { trend: "stable", deltaRatio };
}

function getTaskCategoryFromDescription(description: string | null): TaskCategory | "unknown" {
  if (!description) return "unknown";
  const prefix = "Completed: ";
  if (!description.startsWith(prefix)) return "unknown";
  const name = description.slice(prefix.length).trim();
  const task = DEFAULT_TASKS.find((t) => t.name === name);
  return task?.category ?? "unknown";
}

type Dimension = "Learning" | "Building" | "Planning" | "Reviewing" | "Execution";

function mapToDimension(taskCategory: TaskCategory | "unknown", description: string | null): Dimension {
  // Prefer deterministic mapping by category, with light keyword refinement.
  if (taskCategory === "learning") return "Learning";
  if (taskCategory === "focus") return "Planning";
  if (taskCategory === "reflection") return "Reviewing";

  // Output tasks cover "Building" and "Execution" modes.
  if (taskCategory === "output") {
    const text = (description || "").toLowerCase();
    if (text.includes("ship") || text.includes("write") || text.includes("finish")) return "Building";
    return "Execution";
  }

  // Energy/system/unknown: treat as Execution (system upkeep / foundation).
  return "Execution";
}

export default async function DashboardPage() {
  const user = await requireAuth();

  // Auto-seed tasks only if database is empty (not on every request)
  const existingTasks = await getActiveTasks();
  if (existingTasks.length === 0) {
    try {
      const { initializeTasks } = await import("@/lib/tasks");
      await initializeTasks();
    } catch (e) {
      console.error("Failed to initialize tasks:", e);
    }
  }

  // Ensure tasks exist (used elsewhere in the product).
  // Do not show tasks on this dashboard; this is an analytics console.
  await getActiveTasks();

  const now = new Date();
  const today = startOfDay(now);

  // Use point transactions as the durable activity log (userTask history is not reliable for daily tasks).
  const windowStart = daysAgo(today, 60);
  const transactions = await prisma.pointTransaction.findMany({
    where: {
      userId: user.id,
      createdAt: { gte: windowStart },
      amount: { gt: 0 },
    },
    orderBy: { createdAt: "asc" },
  });

  const last30Start = daysAgo(today, 30);
  const last7Start = daysAgo(today, 7);
  const prev7Start = daysAgo(today, 14);

  const last30 = transactions.filter((t) => t.createdAt >= last30Start);
  const last7 = transactions.filter((t) => t.createdAt >= last7Start);
  const prev7 = transactions.filter((t) => t.createdAt >= prev7Start && t.createdAt < last7Start);

  const actions7 = last7.length;
  const actions30 = last30.length;

  const points7 = last7.reduce((sum, t) => sum + t.amount, 0);
  const points30 = last30.reduce((sum, t) => sum + t.amount, 0);
  const pointsPrev7 = prev7.reduce((sum, t) => sum + t.amount, 0);

  // Consistency: active days in last 30 (days with ≥1 action)
  const activeDaysSet = new Set<string>();
  for (const t of last30) {
    activeDaysSet.add(startOfDay(t.createdAt).toISOString());
  }
  const activeDays30 = activeDaysSet.size;
  const inactiveDays30 = Math.max(0, 30 - activeDays30);
  const consistencyRatio = clamp01(activeDays30 / 30);

  // Focus distribution (task categories) within last 30 actions
  const categoryCounts: Record<string, number> = {
    focus: 0,
    learning: 0,
    output: 0,
    reflection: 0,
    other: 0,
  };
  for (const t of last30) {
    const cat = getTaskCategoryFromDescription(t.description);
    if (cat === "focus" || cat === "learning" || cat === "output" || cat === "reflection") {
      categoryCounts[cat] += 1;
    } else {
      categoryCounts.other += 1;
    }
  }
  const categoryTotal = Math.max(1, last30.length);
  const categoryPercent = {
    focus: categoryCounts.focus / categoryTotal,
    learning: categoryCounts.learning / categoryTotal,
    output: categoryCounts.output / categoryTotal,
    reflection: categoryCounts.reflection / categoryTotal,
    other: categoryCounts.other / categoryTotal,
  };

  // Momentum trend: compare last 7 days vs previous 7 days (by points earned)
  const { trend, deltaRatio } = computeTrend(points7, pointsPrev7);
  const trendLabel = trend === "increasing" ? "Increasing" : trend === "declining" ? "Declining" : "Stable";

  // Time flow: per-day counts for last 14 days
  const flowDays = 14;
  const flowStart = daysAgo(today, flowDays - 1);
  const dailyCounts: number[] = Array.from({ length: flowDays }, () => 0);
  for (const t of transactions) {
    if (t.createdAt < flowStart) continue;
    const dayIndex = Math.floor((startOfDay(t.createdAt).getTime() - flowStart.getTime()) / (24 * 60 * 60 * 1000));
    if (dayIndex >= 0 && dayIndex < flowDays) dailyCounts[dayIndex] += 1;
  }
  const maxDaily = Math.max(1, ...dailyCounts);
  const avgDaily = dailyCounts.reduce((a, b) => a + b, 0) / flowDays;
  const zeroDays = dailyCounts.filter((c) => c === 0).length;
  const burstRatio = maxDaily / Math.max(1, avgDaily);

  // Activity dimensions (last 30 days)
  const dimensionCounts: Record<Dimension, number> = {
    Learning: 0,
    Building: 0,
    Planning: 0,
    Reviewing: 0,
    Execution: 0,
  };
  for (const t of last30) {
    const cat = getTaskCategoryFromDescription(t.description);
    const dim = mapToDimension(cat === "unknown" ? "system" : cat, t.description);
    dimensionCounts[dim] += 1;
  }
  const dimensionTotal = Math.max(1, last30.length);
  const dimensionEntries: Array<{ label: Dimension; count: number; pct: number }> = (Object.keys(dimensionCounts) as Dimension[])
    .map((label) => ({ label, count: dimensionCounts[label], pct: dimensionCounts[label] / dimensionTotal }))
    .sort((a, b) => b.pct - a.pct);

  // Insights (neutral, observational)
  const insights: string[] = [];
  if (burstRatio >= 2.2) {
    insights.push("Activity is concentrated in short bursts.");
  } else if (zeroDays >= 5) {
    insights.push("There are noticeable gaps between active days in the last two weeks.");
  } else {
    insights.push("Activity is relatively steady across days.");
  }

  const topDim = dimensionEntries[0];
  if (topDim && topDim.pct >= 0.6) {
    insights.push(`Most logged actions fall into ${topDim.label.toLowerCase()} mode.`);
  } else {
    insights.push("Work modes are fairly balanced across the last 30 days.");
  }

  const planningReview = dimensionCounts.Planning + dimensionCounts.Reviewing;
  const executionBuild = dimensionCounts.Execution + dimensionCounts.Building;
  if (planningReview > executionBuild * 1.3) {
    insights.push("Planning and review actions outweigh execution-oriented actions recently.");
  } else if (executionBuild > planningReview * 1.3) {
    insights.push("Execution-oriented actions outweigh planning/review recently.");
  } else {
    insights.push("Planning/review and execution are close to parity.");
  }

  if (trend === "declining") {
    insights.push("Momentum has slowed slightly compared to the prior week.");
  } else if (trend === "increasing") {
    insights.push("Momentum has increased compared to the prior week.");
  } else {
    insights.push("Momentum is stable week-over-week.");
  }

  // Soft guidance (no tasks, no commands)
  let guidance = "Maintaining a steady cadence tends to improve clarity over time.";
  if (activeDays30 <= 8) {
    guidance = "A smaller, steadier cadence may improve consistency without increasing load.";
  } else if (planningReview > executionBuild * 1.3) {
    guidance = "Consider shifting a bit toward execution-focused actions to balance the system.";
  } else if (burstRatio >= 2.2) {
    guidance = "Reducing context switching may help smooth momentum across days.";
  } else if (trend === "declining") {
    guidance = "Maintaining current pace may help stabilize momentum in the next week.";
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
      {/* Animated Backgrounds */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <GradientMesh />
        <AnimatedBackground />
        <ParticleField />
        <AnimatedShapes />
      </div>
      
      <Sidebar />
      
      {/* Main Content - responsive margin for sidebar */}
      <div className="lg:ml-64 relative z-10">
        <div className="relative">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200 shadow-sm">
            <div className="px-4 lg:px-8 py-3 md:py-4 flex items-center justify-between">
              <div className="ml-12 lg:ml-0">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl md:text-2xl font-bold iridescent">Personal Analytics</h2>
                  <CorovelTokenBadge variant="compact" />
                </div>
                <p className="text-xs md:text-sm text-[#6B7280] mt-0.5 md:mt-1">A system view of your recent behavior</p>
              </div>
              <div className="flex items-center gap-3 md:gap-4">
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg border border-primary-200">
                  <Icon icon={Coins} size="sm" className="text-primary-600" />
                  <div>
                    <div className="text-sm font-bold text-primary-700">{user.points}</div>
                    <div className="text-xs text-primary-600">Tokens</div>
                  </div>
                </div>
                <HeaderLogoutButton />
              </div>
            </div>
          </header>

          <main className="p-4 md:p-6 lg:p-8 animate-fade-in">
          {/* SECTION 1 — SYSTEM OVERVIEW */}
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-[#1F2937]">System Overview</h3>
              <p className="text-xs md:text-sm text-[#6B7280]">A lightweight snapshot of recent activity windows.</p>
            </div>
            <Link
              href="/dashboard/tasks"
              className="text-xs md:text-sm text-[#6366F1] hover:text-[#8B5CF6] font-medium min-h-[44px] flex items-center"
            >
              Log actions →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-10">
            {/* Total Progress - Corovel Tokens */}
            <div className="premium-card card-hover card-glow rounded-xl p-4 md:p-6 stagger-item relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-400/20 to-purple-400/20 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="premium-card-content relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Icon icon={Coins} size="sm" className="text-primary-600" />
                  <p className="text-xs md:text-sm text-[#6B7280] font-medium">Corovel Tokens</p>
                </div>
                <div className="mt-2 text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                  {user.points.toLocaleString()}
                </div>
                <p className="text-[11px] md:text-xs text-[#6B7280] mt-2">Your total token balance</p>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <CorovelTokenBadge variant="compact" />
                </div>
              </div>
            </div>

            {/* Points Earned */}
            <div className="premium-card card-hover card-glow rounded-xl p-4 md:p-6 stagger-item">
              <div className="premium-card-content">
                <p className="text-xs md:text-sm text-[#6B7280] font-medium">Points Earned</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="text-2xl md:text-3xl font-bold text-[#1F2937]">{points7.toLocaleString()}</div>
                  <div className="text-xs md:text-sm text-[#6B7280]">/ {points30.toLocaleString()}</div>
                </div>
                <p className="text-[11px] md:text-xs text-[#6B7280] mt-2">
                  Points earned in the last 7 days / 30 days ({actions7} / {actions30} actions).
                </p>
              </div>
            </div>

            {/* Consistency */}
            <div className="premium-card card-hover card-glow rounded-xl p-4 md:p-6 stagger-item">
              <div className="premium-card-content">
                <p className="text-xs md:text-sm text-[#6B7280] font-medium">Consistency</p>
                <div className="mt-2 text-2xl md:text-3xl font-bold text-[#1F2937]">
                  {activeDays30}<span className="text-sm md:text-base font-normal">/{30}</span>
                </div>
                <p className="text-[11px] md:text-xs text-[#6B7280] mt-1">Active days vs inactive days (30d): {activeDays30} active, {inactiveDays30} inactive.</p>
                <div className="mt-3 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full bg-[#1F2937]/40 transition-smooth" style={{ width: `${Math.round(consistencyRatio * 100)}%` }} />
                </div>
              </div>
            </div>

            {/* Focus Distribution */}
            <div className="premium-card card-hover card-glow rounded-xl p-4 md:p-6 stagger-item">
              <div className="premium-card-content">
                <p className="text-xs md:text-sm text-[#6B7280] font-medium">Focus Distribution</p>
                <p className="text-[11px] md:text-xs text-[#6B7280] mt-2">Where actions landed in the last 30 days.</p>
                <div className="mt-3 space-y-2">
                  {([
                    { key: "focus", label: "Focus" },
                    { key: "output", label: "Output" },
                    { key: "learning", label: "Learning" },
                    { key: "reflection", label: "Review" },
                  ] as const).map((row) => (
                    <div key={row.key} className="flex items-center gap-2">
                      <div className="w-16 text-[11px] md:text-xs text-[#6B7280]">{row.label}</div>
                      <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                        <div
                          className="h-full bg-[#6366F1]/40 transition-smooth"
                          style={{ width: `${Math.round(categoryPercent[row.key] * 100)}%` }}
                        />
                      </div>
                      <div className="w-10 text-right text-[11px] md:text-xs text-[#6B7280]">{formatPercent(categoryPercent[row.key])}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Momentum Trend */}
            <div className="premium-card card-hover card-glow rounded-xl p-4 md:p-6 stagger-item">
              <div className="premium-card-content">
                <p className="text-xs md:text-sm text-[#6B7280] font-medium">Momentum Trend</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-2xl md:text-3xl font-bold text-[#1F2937]">{trendLabel}</div>
                    <p className="text-[11px] md:text-xs text-[#6B7280] mt-1">
                      Compared to the previous 7 days ({formatSignedPercent(deltaRatio)} by points).
                    </p>
                  </div>
                  <div className="w-28 h-10 flex items-end gap-0.5" aria-label="14-day activity sparkline">
                    {dailyCounts.map((c, idx) => (
                      <div
                        key={idx}
                        className="flex-1 rounded-sm bg-[#1F2937]/15 transition-smooth hover:bg-[#1F2937]/25"
                        style={{ height: `${Math.max(10, Math.round((c / maxDaily) * 100))}%` }}
                        title={`${c} actions`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2 — DIMENSIONAL ANALYSIS */}
          <div className="premium-card card-hover card-glow rounded-xl p-4 md:p-6 mb-6 md:mb-10">
            <div className="premium-card-content">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-[#1F2937]">Activity Dimensions</h3>
                  <p className="text-xs md:text-sm text-[#6B7280] mt-1">
                    This shows how your logged actions distribute across different modes of work.
                  </p>
                </div>
                <div className="text-[11px] md:text-xs text-[#6B7280]">Window: last 30 days</div>
              </div>

              <div className="mt-4 space-y-3">
                {(Object.keys(dimensionCounts) as Dimension[]).map((label) => {
                  const count = dimensionCounts[label];
                  const pct = count / dimensionTotal;
                  return (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-24 text-sm text-[#1F2937] font-medium">{label}</div>
                      <div className="flex-1 h-2.5 rounded-full bg-gray-200 overflow-hidden">
                        <div className="h-full bg-[#111827]/35 transition-smooth" style={{ width: `${Math.round(pct * 100)}%` }} />
                      </div>
                      <div className="w-24 text-right text-xs text-[#6B7280]">{formatPercent(pct)} · {count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 3 — TIME FLOW ANALYSIS */}
          <div className="premium-card card-hover card-glow rounded-xl p-4 md:p-6 mb-6 md:mb-10">
            <div className="premium-card-content">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-[#1F2937]">Time Flow</h3>
                  <p className="text-xs md:text-sm text-[#6B7280] mt-1">Activity volume by day, highlighting gaps and peaks.</p>
                </div>
                <div className="text-[11px] md:text-xs text-[#6B7280]">Last 14 days</div>
              </div>

              <div className="mt-4">
                <div className="h-28 flex items-end gap-1">
                  {dailyCounts.map((c, idx) => {
                    const heightPct = Math.round((c / maxDaily) * 100);
                    const day = new Date(flowStart);
                    day.setDate(flowStart.getDate() + idx);
                    const label = day.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full h-24 bg-gray-100 rounded-md overflow-hidden">
                          <div
                            className="w-full bg-[#1F2937]/35 transition-smooth hover:bg-[#1F2937]/45"
                            style={{ height: `${Math.max(0, heightPct)}%` }}
                            title={`${label}: ${c} actions`}
                          />
                        </div>
                        <div className="text-[10px] text-[#9CA3AF] whitespace-nowrap">{label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4 + 5 — INSIGHTS + SOFT GUIDANCE */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6">
            <div className="premium-card card-hover card-glow rounded-xl p-4 md:p-6 lg:col-span-2">
              <div className="premium-card-content">
                <h3 className="text-base md:text-lg font-semibold text-[#1F2937]">Insights</h3>
                <p className="text-xs md:text-sm text-[#6B7280] mt-1">Observations from the last 30 days. No comparison, just signal.</p>
                <div className="mt-4 space-y-2">
                  {insights.slice(0, 4).map((text, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-[#1F2937]/40" />
                      <p className="text-sm text-[#1F2937]">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="premium-card card-hover card-glow rounded-xl p-4 md:p-6">
              <div className="premium-card-content">
                <h3 className="text-base md:text-lg font-semibold text-[#1F2937]">Recommended Adjustment</h3>
                <p className="text-xs md:text-sm text-[#6B7280] mt-1">A subtle nudge based on recent patterns.</p>
                <p className="text-sm text-[#1F2937] mt-4">{guidance}</p>

                <div className="mt-6 text-[11px] md:text-xs text-[#6B7280]">
                  Source: your logged actions (no social comparison).
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="text-center py-4 md:py-6 border-t border-gray-200 mt-6 md:mt-8">
            <p className="text-[10px] md:text-xs text-[#6B7280]">
              Corovel is personal-only: no ranks, no comparison.
            </p>
          </footer>
        </main>
        </div>
      </div>
    </div>
  );
}
