import { requireAuth } from "@/lib/auth-utils";
import { getActiveTasks, getUserCompletedTasks, getUserDailyStreak, getWeeklyChallengeProgress, getTaskCategory, getTaskDescription, TASK_CATEGORIES, TaskCategory } from "@/lib/tasks";
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

  // Check if user has logged any action today
  const hasCheckedInToday = todayCompletedTasks.size > 0;

  // Enrich tasks with completion status, category, and description
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
      category: getTaskCategory(task.name),
      description: getTaskDescription(task.name),
    };
  });

  // Get featured tasks (one from each main category, prioritizing incomplete)
  const categoryOrder: TaskCategory[] = ["focus", "output", "learning", "reflection"];
  const featuredTasks = categoryOrder
    .map(cat => {
      const categoryTasks = enrichedTasks.filter(t => t.category === cat && t.type === "daily");
      // Prioritize incomplete tasks
      return categoryTasks.find(t => !t.isCompletedToday) || categoryTasks[0];
    })
    .filter(Boolean)
    .slice(0, 4);

  return (
    <div className="min-h-screen gradient-mesh">
      <Sidebar />
      
      {/* Main Content - responsive margin for sidebar */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200 shadow-sm">
          <div className="px-4 lg:px-8 py-3 md:py-4 flex items-center justify-between">
            <div className="ml-12 lg:ml-0">
              <h2 className="text-xl md:text-2xl font-bold text-[#1F2937]">Dashboard</h2>
              <p className="text-xs md:text-sm text-[#6B7280] mt-0.5 md:mt-1">Your progress at a glance</p>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <HeaderLogoutButton />
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8">
          {/* Retention Hooks */}
          <div className="mb-6 md:mb-12">
            <RetentionHooks
              streak={streak}
              hasCheckedInToday={hasCheckedInToday}
              userRank={userRank}
              totalUsers={totalUsers}
            />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
            <div className="premium-card rounded-xl p-4 md:p-6">
              <div className="premium-card-content">
                <div className="flex items-center justify-between mb-1 md:mb-2">
                  <p className="text-xs md:text-sm text-[#6B7280] font-medium">Progress Signal</p>
                  <span className="text-lg md:text-2xl">📊</span>
                </div>
                <div className="text-xl md:text-3xl font-bold text-[#1F2937]">
                  <AnimatedPoints points={user.points} />
                </div>
                <p className="text-[10px] md:text-xs text-[#6B7280] mt-1 md:mt-2">Cumulative progress</p>
              </div>
            </div>

            <div className="premium-card rounded-xl p-4 md:p-6">
              <div className="premium-card-content">
                <div className="flex items-center justify-between mb-1 md:mb-2">
                  <p className="text-xs md:text-sm text-[#6B7280] font-medium">Momentum</p>
                  <span className="text-lg md:text-2xl">→</span>
                </div>
                <div className="text-xl md:text-3xl font-bold text-[#1F2937]">{streak} <span className="text-sm md:text-base font-normal">days</span></div>
                <p className="text-[10px] md:text-xs text-[#6B7280] mt-1 md:mt-2">Consecutive activity</p>
              </div>
            </div>

            <div className="premium-card rounded-xl p-4 md:p-6">
              <div className="premium-card-content">
                <div className="flex items-center justify-between mb-1 md:mb-2">
                  <p className="text-xs md:text-sm text-[#6B7280] font-medium">This Week</p>
                  <span className="text-lg md:text-2xl">📅</span>
                </div>
                <div className="text-xl md:text-3xl font-bold text-[#1F2937]">
                  {weeklyProgress.current}/{weeklyProgress.target}
                </div>
                <p className="text-[10px] md:text-xs text-[#6B7280] mt-1 md:mt-2">Actions logged</p>
              </div>
            </div>

            <div className="premium-card rounded-xl p-4 md:p-6">
              <div className="premium-card-content">
                <div className="flex items-center justify-between mb-1 md:mb-2">
                  <p className="text-xs md:text-sm text-[#6B7280] font-medium">Position</p>
                  <span className="text-lg md:text-2xl">#</span>
                </div>
                <div className="text-xl md:text-3xl font-bold text-[#1F2937]">
                  {userRank || "—"}
                </div>
                <p className="text-[10px] md:text-xs text-[#6B7280] mt-1 md:mt-2">Among all users</p>
              </div>
            </div>
          </div>

          {/* Tasks Section - Featured Actions */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div>
                <h2 className="text-lg md:text-2xl font-bold text-[#1F2937]">Today&apos;s Focus</h2>
                <p className="text-xs md:text-sm text-[#6B7280]">One action from each category</p>
              </div>
              <Link href="/dashboard/tasks" className="text-xs md:text-sm text-[#6366F1] hover:text-[#8B5CF6] font-medium min-h-[44px] flex items-center">
                All Actions →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {featuredTasks.map((task, index) => (
                <div key={task.id} className="stagger-item" style={{ animationDelay: `${index * 0.05}s` }}>
                  <TaskCard
                    id={task.id}
                    name={task.name}
                    type={task.type}
                    points={task.points}
                    isCompleted={task.isCompleted}
                    isCompletedToday={task.isCompletedToday}
                    canComplete={task.canComplete}
                    category={task.category}
                    description={task.description}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <footer className="text-center py-4 md:py-6 border-t border-gray-200 mt-6 md:mt-8">
            <p className="text-[10px] md:text-xs text-[#6B7280]">
              Progress signals are for personal tracking only.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
