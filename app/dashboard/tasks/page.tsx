import { requireAuth } from "@/lib/auth-utils";
import { getActiveTasks, getUserCompletedTasks } from "@/lib/tasks";
import TaskCard from "@/components/TaskCard";
import Sidebar from "@/components/Sidebar";

export default async function TasksPage() {
  const user = await requireAuth();
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
    };
  });

  return (
    <div className="min-h-screen gradient-mesh">
      <Sidebar />
      <div className="ml-64">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200 shadow-sm">
          <div className="px-8 py-4">
            <h2 className="text-2xl font-bold text-[#1F2937]">Tasks</h2>
            <p className="text-sm text-[#6B7280] mt-1">Complete tasks to earn points</p>
          </div>
        </header>
        <main className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {enrichedTasks.map((task, index) => (
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
        </main>
      </div>
    </div>
  );
}
