import { requireAuth } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";
import { getActiveTasks, getUserCompletedTasks, getTaskCategory, getTaskDescription, TASK_CATEGORIES, TaskCategory } from "@/lib/tasks";
import TaskCard from "@/components/TaskCard";
import Sidebar from "@/components/Sidebar";

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
    <div className="min-h-screen gradient-mesh">
      <Sidebar />
      <div className="lg:ml-64">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200 shadow-sm">
          <div className="px-4 lg:px-8 py-3 md:py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-bold iridescent ml-12 lg:ml-0">Daily Actions</h2>
                <p className="text-xs md:text-sm text-[#6B7280] mt-1 ml-12 lg:ml-0">Choose actions that move you forward</p>
              </div>
              <div className="hidden sm:block text-right">
                <div className="text-2xl font-bold text-[#6366F1]">{todayLoggedCount}</div>
                <div className="text-xs text-[#6B7280]">logged today</div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="p-3 md:p-4 lg:p-8 space-y-6 md:space-y-8 animate-fade-in">
          {/* Category sections */}
          {tasksByCategory.map((group) => (
            <section key={group.category}>
              <div className="mb-3 md:mb-4">
                <h3 className="text-lg md:text-xl font-semibold text-[#1F2937]">{group.label}</h3>
                <p className="text-xs md:text-sm text-[#6B7280]">{group.description}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {group.tasks.map((task, index) => (
                  <div key={task.id} className="stagger-item" style={{ animationDelay: `${index * 0.03}s` }}>
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
            <section>
              <div className="mb-3 md:mb-4 pt-4 border-t border-gray-200">
                <h3 className="text-lg md:text-xl font-semibold text-[#1F2937]">System</h3>
                <p className="text-xs md:text-sm text-[#6B7280]">Platform bonuses and one-time actions</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {systemTasks.map((task, index) => (
                  <div key={task.id} className="stagger-item" style={{ animationDelay: `${index * 0.03}s` }}>
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
        </main>
      </div>
    </div>
  );
}
