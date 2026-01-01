import { requireAuth } from "@/lib/auth-utils";
import Sidebar from "@/components/Sidebar";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireAuth();

  return (
    <div className="min-h-screen gradient-mesh">
      <Sidebar />
      <div className="lg:ml-64">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200 shadow-sm">
          <div className="px-4 lg:px-8 py-3 md:py-4">
            <h2 className="text-xl md:text-2xl font-bold text-[#1F2937] ml-12 lg:ml-0">Profile</h2>
            <p className="text-xs md:text-sm text-[#6B7280] mt-1 ml-12 lg:ml-0">Your account</p>
          </div>
        </header>
        <main className="p-3 md:p-4 lg:p-8">
          <div className="premium-card rounded-xl p-4 md:p-8 max-w-2xl">
            <div className="premium-card-content">
              <h3 className="text-lg md:text-xl font-semibold text-[#1F2937] mb-4 md:mb-6">Account Details</h3>
              <div className="space-y-3 md:space-y-4">
                <div>
                  <p className="text-xs md:text-sm text-[#6B7280] mb-1">Email</p>
                  <p className="text-[#1F2937] font-medium text-sm md:text-base break-all">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-[#6B7280] mb-1">Progress</p>
                  <p className="text-[#1F2937] font-medium text-xl md:text-2xl">{user.points.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-[#6B7280] mb-1">Invite Code</p>
                  <p className="text-[#1F2937] font-medium font-mono text-sm md:text-base">{user.referralCode}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
