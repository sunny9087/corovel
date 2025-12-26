import { requireAuth } from "@/lib/auth-utils";
import Sidebar from "@/components/Sidebar";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireAuth();

  return (
    <div className="min-h-screen gradient-mesh">
      <Sidebar />
      <div className="ml-64">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200 shadow-sm">
          <div className="px-8 py-4">
            <h2 className="text-2xl font-bold text-[#1F2937]">Profile</h2>
            <p className="text-sm text-[#6B7280] mt-1">Your account information</p>
          </div>
        </header>
        <main className="p-8">
          <div className="premium-card rounded-xl p-8 max-w-2xl">
            <div className="premium-card-content">
              <h3 className="text-xl font-semibold text-[#1F2937] mb-6">Account Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[#6B7280] mb-1">Email</p>
                  <p className="text-[#1F2937] font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-[#6B7280] mb-1">Total Points</p>
                  <p className="text-[#1F2937] font-medium text-2xl">{user.points.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-[#6B7280] mb-1">Referral Code</p>
                  <p className="text-[#1F2937] font-medium font-mono">{user.referralCode}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
