import { requireAuth } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";
import Sidebar from "@/components/Sidebar";
import ReferralCodeDisplay from "@/components/ReferralCodeDisplay";

export default async function ReferralPage() {
  const user = await requireAuth();

  return (
    <div className="min-h-screen gradient-mesh">
      <Sidebar />
      <div className="lg:ml-64">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200 shadow-sm">
          <div className="px-4 lg:px-8 py-3 md:py-4">
            <h2 className="text-xl md:text-2xl font-bold text-[#1F2937] ml-12 lg:ml-0">Invite Others</h2>
            <p className="text-xs md:text-sm text-[#6B7280] mt-1 ml-12 lg:ml-0">Share Corovel with others</p>
          </div>
        </header>
        <main className="p-3 md:p-4 lg:p-8">
          <div className="premium-card rounded-xl p-4 md:p-8 max-w-2xl">
            <div className="premium-card-content">
              <h3 className="text-lg md:text-xl font-semibold text-[#1F2937] mb-4 md:mb-6">Your Invite Code</h3>
              <div className="mb-4 md:mb-6">
                <ReferralCodeDisplay referralCode={user.referralCode} />
              </div>
              <div className="bg-gradient-to-r from-yellow-50 to-cyan-50 border border-gray-200 rounded-lg p-4 md:p-6">
                <p className="text-xs md:text-sm text-[#1F2937] leading-relaxed">
                  Share your code with others. When someone joins using your code,
                  both of you start with a progress boost.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
