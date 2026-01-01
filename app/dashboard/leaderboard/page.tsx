import Sidebar from "@/components/Sidebar";
import Leaderboard from "@/components/Leaderboard";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  return (
    <div className="min-h-screen gradient-mesh">
      <Sidebar />
      <div className="lg:ml-64">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200 shadow-sm">
          <div className="px-4 lg:px-8 py-3 md:py-4">
            <h2 className="text-xl md:text-2xl font-bold text-[#1F2937] ml-12 lg:ml-0">Progress</h2>
            <p className="text-xs md:text-sm text-[#6B7280] mt-1 ml-12 lg:ml-0">See how everyone is building</p>
          </div>
        </header>
        <main className="p-3 md:p-4 lg:p-8">
          <Leaderboard />
        </main>
      </div>
    </div>
  );
}
