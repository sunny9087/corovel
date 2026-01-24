import { requireAuth } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";
import { getActiveTasks, getUserCompletedTasks, getTaskCategory, getTaskDescription, TASK_CATEGORIES, TaskCategory } from "@/lib/tasks";
import TaskCard from "@/components/TaskCard";
import Sidebar from "@/components/Sidebar";
import CorovelTokenBadge from "@/components/CorovelTokenBadge";
import TokenAnimation from "@/components/TokenAnimation";
import AnimatedBackground from "@/components/AnimatedBackground";
import GradientMesh from "@/components/GradientMesh";
import ParticleField from "@/components/ParticleField";
import AnimatedShapes from "@/components/AnimatedShapes";
import { Coins, TrendingUp, Zap } from "lucide-react";
import Icon from "@/components/ui/Icon";

export default async function TasksPage() {
  const user = await requireAuth();

  // Auto-seed tasks if database is empty
  const existingTasks = await getActiveTasks();
  if (existingTasks.length === 0) {
    try {
      const { initializeTasks } = await import("@/lib/tasks");
      await initializeTasks();
    } catch (e) {
      console.error("Failed to initialize tasks:", e);
    }
  }

  const tasks = await getActiveTasks();
  const completedTasks = await getUserCompletedTasks(user.id);

  const completedTaskIds = new Set(completedTasks.map((ut) => ut.taskId));
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

  // Group tasks by category (excluding system tasks from main view)
  const categoryOrder: TaskCategory[] = ["focus", "learning", "output", "reflection", "energy"];
  const tasksByCategory = categoryOrder.map(cat => ({
    category: cat,
    label: TASK_CATEGORIES[cat].label,
    description: TASK_CATEGORIES[cat].description,
    tasks: enrichedTasks.filter(t => t.category === cat && t.type === "daily"),
  })).filter(group => group.tasks.length > 0);

  // System tasks (referral, weekly, one-time) shown separately
  const systemTasks = enrichedTasks.filter(t => t.category === "system" || t.type !== "daily");

  // Count today's logged actions
  const todayLoggedCount = enrichedTasks.filter(t => t.isCompletedToday && t.type === "daily").length;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
      {/* Animated Backgrounds */}
      <GradientMesh />
      <AnimatedBackground />
      <ParticleField />
      <AnimatedShapes />
      <TokenAnimation />
      
      <Sidebar />
      <div className="lg:ml-64 relative z-10">
        
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200 shadow-sm">
          <div className="px-4 lg:px-8 py-3 md:py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 ml-12 lg:ml-0">
                  <h2 className="text-xl md:text-2xl font-bold iridescent">Daily Actions</h2>
                  <CorovelTokenBadge variant="compact" />
                </div>
                <p className="text-xs md:text-sm text-[#6B7280] mt-1 ml-12 lg:ml-0">
                  Earn Corovel tokens by completing actions
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary-600">{todayLoggedCount}</div>
                  <div className="text-xs text-[#6B7280]">logged today</div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg border border-primary-200">
                  <Icon icon={Coins} size="sm" className="text-primary-600" />
                  <div>
                    <div className="text-sm font-bold text-primary-700">{user.points}</div>
                    <div className="text-xs text-primary-600">Corovel Tokens</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="p-3 md:p-4 lg:p-8 space-y-6 md:space-y-8 animate-fade-in relative z-10">
          {/* Corovel Token Hero Section */}
          <div className="premium-card rounded-2xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-purple-500/10 to-accent-500/10" />
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Icon icon={Zap} size="lg" className="text-primary-600" />
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900">Earn Corovel Tokens</h3>
                  </div>
                  <p className="text-sm md:text-base text-gray-600">
                    Every action you complete earns you Corovel tokens. Build your token balance by maintaining daily momentum.
                  </p>
                </div>
                <CorovelTokenBadge variant="large" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="flex items-center gap-3 p-4 bg-white/60 rounded-lg backdrop-blur-sm">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Icon icon={TrendingUp} size="md" className="text-primary-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{user.points}</div>
                    <div className="text-xs text-gray-600">Total Tokens</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/60 rounded-lg backdrop-blur-sm">
                  <div className="p-2 bg-accent-100 rounded-lg">
                    <Icon icon={Coins} size="md" className="text-accent-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{todayLoggedCount}</div>
                    <div className="text-xs text-gray-600">Actions Today</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/60 rounded-lg backdrop-blur-sm">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Icon icon={Zap} size="md" className="text-purple-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {enrichedTasks.filter(t => t.canComplete && t.type === "daily").length}
                    </div>
                    <div className="text-xs text-gray-600">Available Now</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Category sections */}
          {tasksByCategory.map((group) => (
            <section key={group.category} className="relative">
              <div className="mb-4 md:mb-6 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg md:text-xl font-semibold text-[#1F2937]">{group.label}</h3>
                    <div className="px-2 py-0.5 bg-primary-100 rounded-full">
                      <span className="text-xs font-medium text-primary-700">
                        +{group.tasks.reduce((sum, t) => sum + t.points, 0)} tokens
                      </span>
                    </div>
                  </div>
                  <p className="text-xs md:text-sm text-[#6B7280]">{group.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {group.tasks.map((task, index) => (
                  <div 
                    key={task.id} 
                    className="stagger-item transform transition-all duration-300 hover:scale-105" 
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
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
            </section>
          ))}

          {/* System tasks */}
          {systemTasks.length > 0 && (
            <section className="relative">
              <div className="mb-4 md:mb-6 pt-6 border-t-2 border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg md:text-xl font-semibold text-[#1F2937]">System Rewards</h3>
                      <CorovelTokenBadge variant="compact" />
                    </div>
                    <p className="text-xs md:text-sm text-[#6B7280]">
                      Platform bonuses and one-time actions that earn Corovel tokens
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {systemTasks.map((task, index) => (
                  <div 
                    key={task.id} 
                    className="stagger-item transform transition-all duration-300 hover:scale-105" 
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
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
            </section>
          )}

          {/* Corovel Token Info Footer */}
          <div className="premium-card rounded-xl p-6 md:p-8 mt-8 bg-gradient-to-br from-primary-50 via-purple-50 to-accent-50 border-2 border-primary-200">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              <div className="flex-shrink-0">
                <div className="p-4 bg-gradient-to-r from-primary-500 to-purple-500 rounded-2xl">
                  <Icon icon={Coins} size="xl" className="text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                  About Corovel Tokens
                </h3>
                <p className="text-sm md:text-base text-gray-700 mb-3">
                  Corovel is our native token that rewards consistent action and momentum. 
                  Every task you complete earns you tokens, building your balance over time.
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-white/80 rounded-full text-xs font-medium text-primary-700">
                    ✓ Earned through actions
                  </span>
                  <span className="px-3 py-1 bg-white/80 rounded-full text-xs font-medium text-primary-700">
                    ✓ Track your progress
                  </span>
                  <span className="px-3 py-1 bg-white/80 rounded-full text-xs font-medium text-primary-700">
                    ✓ Build momentum
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
