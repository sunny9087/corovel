import { requireAuth } from "@/lib/auth-utils";
import Sidebar from "@/components/Sidebar";
import ReferralCodeDisplay from "@/components/ReferralCodeDisplay";

export default async function ReferralPage() {
  const user = await requireAuth();

  return (
    <div className="min-h-screen gradient-mesh">
      <Sidebar />
      <div className="ml-64">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200 shadow-sm">
          <div className="px-8 py-4">
            <h2 className="text-2xl font-bold text-[#1F2937]">Referral Program</h2>
            <p className="text-sm text-[#6B7280] mt-1">Share and earn rewards</p>
          </div>
        </header>
        <main className="p-8">
          <div className="premium-card rounded-xl p-8 max-w-2xl">
            <div className="premium-card-content">
              <h3 className="text-xl font-semibold text-[#1F2937] mb-6">Your Referral Code</h3>
              <div className="mb-6">
                <ReferralCodeDisplay referralCode={user.referralCode} />
              </div>
              <div className="bg-gradient-to-r from-yellow-50 to-cyan-50 border border-gray-200 rounded-lg p-6">
                <p className="text-sm text-[#1F2937] leading-relaxed">
                  Share your referral code with friends! When someone signs up using your code,
                  both you and your friend will receive <strong className="text-[#6366F1]">10 points</strong> (one-time reward).
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
