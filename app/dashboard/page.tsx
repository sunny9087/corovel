import { requireAuth } from "@/lib/auth-utils";
import { getActiveTasks, getUserCompletedTasks, getUserDailyStreak, getWeeklyChallengeProgress } from "@/lib/tasks";
import { getUserRank } from "@/lib/leaderboard";
import { getTotalUsers } from "@/lib/analytics";
import TaskCard from "@/components/TaskCard";
import AnimatedPoints from "@/components/AnimatedPoints";
import RetentionHooks from "@/components/RetentionHooks";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import HeaderLogoutButton from "@/components/HeaderLogoutButton";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireAuth();

  // Auto-seed tasks if none exist
  const existingTasks = await getActiveTasks();
  if (existingTasks.length === 0) {
    const { initializeTasks } = await import("@/lib/tasks");
    await initializeTasks();
  }

  // Get tasks and user progress
  const tasks = await getActiveTasks();
  const completedTasks = await getUserCompletedTasks(user.id);
  const streak = await getUserDailyStreak(user.id);
  const weeklyProgress = await getWeeklyChallengeProgress(user.id);
  
  // Get leaderboard data for retention hooks
  const userRank = await getUserRank(user.id);
  const totalUsers = await getTotalUsers();

  // Create completion map
  const completedTaskIds = new Set(completedTasks.map((ut) => ut.taskId));

  // Check daily completion status
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayCompletedTasks = new Set<string>();
  for (const completedTask of completedTasks) {
    const task = tasks.find((t) => t.id === completedTask.taskId);
    if (task && task.type === "daily") {
      const completedAt = new Date(completedTask.completedAt);
      if (completedAt >= today && completedAt < tomorrow) {
        todayCompletedTasks.add(task.id);
      }
    }
  }

  // Check if user has checked in today
  const dailyTask = tasks.find((t) => t.name === "Daily Check-in");
  const hasCheckedInToday = dailyTask ? todayCompletedTasks.has(dailyTask.id) : false;

  // Enrich tasks with completion status
  const enrichedTasks = tasks.map((task) => {
    const isCompleted = completedTaskIds.has(task.id);
    const isCompletedToday = todayCompletedTasks.has(task.id);
    const canComplete =
      task.type === "daily"
        ? !isCompletedToday
        : task.type === "one_time"
        ? !isCompleted
        : false;

    return {
      ...task,
      isCompleted,
      isCompletedToday,
      canComplete,
    };
  });

  return (
    <div className="min-h-screen gradient-mesh">
      <Sidebar />
      
      {/* Main Content - responsive margin for sidebar */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200 shadow-sm">
          <div className="px-4 lg:px-8 py-4 flex items-center justify-between">
            <div className="ml-12 lg:ml-0">
              <h2 className="text-2xl font-bold text-[#1F2937]">Dashboard</h2>
              <p className="text-sm text-[#6B7280] mt-1">Welcome back! Build your habits today</p>
            </div>
            <div className="flex items-center gap-4">
              <HeaderLogoutButton />
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          {/* Retention Hooks */}
          <div className="mb-12">
            <RetentionHooks
              streak={streak}
              hasCheckedInToday={hasCheckedInToday}
              userRank={userRank}
              totalUsers={totalUsers}
            />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="premium-card rounded-xl p-6">
              <div className="premium-card-content">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-[#6B7280] font-medium">Total Points</p>
                  <span className="text-2xl">💰</span>
                </div>
                <div className="text-3xl font-bold text-[#1F2937]">
                  <AnimatedPoints points={user.points} />
                </div>
                <p className="text-xs text-[#6B7280] mt-2">Internal points only</p>
              </div>
            </div>

            <div className="premium-card rounded-xl p-6">
              <div className="premium-card-content">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-[#6B7280] font-medium">Daily Streak</p>
                  <span className="text-2xl">🔥</span>
                </div>
                <div className="text-3xl font-bold text-[#1F2937]">{streak}</div>
                <p className="text-xs text-[#6B7280] mt-2">Keep it going!</p>
              </div>
            </div>

            <div className="premium-card rounded-xl p-6">
              <div className="premium-card-content">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-[#6B7280] font-medium">Weekly Progress</p>
                  <span className="text-2xl">📈</span>
                </div>
                <div className="text-3xl font-bold text-[#1F2937]">
                  {weeklyProgress.current}/{weeklyProgress.target}
                </div>
                <p className="text-xs text-[#6B7280] mt-2">Daily check-ins</p>
              </div>
            </div>

            <div className="premium-card rounded-xl p-6">
              <div className="premium-card-content">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-[#6B7280] font-medium">Your Rank</p>
                  <span className="text-2xl">🏆</span>
                </div>
                <div className="text-3xl font-bold text-[#1F2937]">
                  #{userRank || "—"}
                </div>
                <p className="text-xs text-[#6B7280] mt-2">Leaderboard position</p>
              </div>
            </div>
          </div>

          {/* Tasks Section - 4 Cards */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#1F2937]">Available Tasks</h2>
              <Link href="/dashboard/tasks" className="text-sm text-[#6366F1] hover:text-[#8B5CF6] font-medium">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {enrichedTasks.slice(0, 4).map((task, index) => (
                <div key={task.id} className="stagger-item" style={{ animationDelay: `${index * 0.05}s` }}>
                  <TaskCard
                    id={task.id}
                    name={task.name}
                    type={task.type}
                    points={task.points}
                    isCompleted={task.isCompleted}
                    isCompletedToday={task.isCompletedToday}
                    canComplete={task.canComplete}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Legal Disclaimer Footer */}
          <footer className="text-center py-6 border-t border-gray-200 mt-8">
            <p className="text-xs text-[#6B7280]">
              Tasks reward internal points only. Points have no monetary value and are not cryptocurrency.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
