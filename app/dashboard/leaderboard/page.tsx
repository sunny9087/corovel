import Sidebar from "@/components/Sidebar";
import Leaderboard from "@/components/Leaderboard";

export default async function LeaderboardPage() {
  return (
    <div className="min-h-screen gradient-mesh">
      <Sidebar />
      <div className="ml-64">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200 shadow-sm">
          <div className="px-8 py-4">
            <h2 className="text-2xl font-bold text-[#1F2937]">Leaderboard</h2>
            <p className="text-sm text-[#6B7280] mt-1">Top users by points</p>
          </div>
        </header>
        <main className="p-8">
          <Leaderboard />
        </main>
      </div>
    </div>
  );
}
