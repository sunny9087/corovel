import { getUserPointTransactions } from "@/lib/auth";
import { requireAuth } from "@/lib/auth-utils";

export default async function PointsHistory() {
  const user = await requireAuth();
  const transactions = await getUserPointTransactions(user.id, 20);

  if (transactions.length === 0) {
    return (
      <div className="bg-[#111827] rounded-xl border border-[#1F2937] p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#E5E7EB] mb-4">
          Points History
        </h2>
        <p className="text-[#9CA3AF]">No transactions yet.</p>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionLabel = (type: string, description: string | null) => {
    if (description) return description;
    
    switch (type) {
      case "daily_checkin":
        return "Daily Check-in";
      case "referral_signup":
        return "Referral Sign-up Bonus";
      case "referral_reward":
        return "Referral Reward";
      case "profile_completion":
        return "Profile Completion";
      case "weekly_challenge":
        return "Weekly Challenge";
      case "manual":
        return "Manual Adjustment";
      default:
        return "Points Transaction";
    }
  };

  return (
    <div className="bg-[#111827] rounded-xl border border-[#1F2937] p-6 mb-6">
      <h2 className="text-xl font-semibold text-[#E5E7EB] mb-4">
        Points History
      </h2>
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex justify-between items-center py-3 border-b border-[#1F2937] last:border-0"
          >
            <div>
              <p className="text-[#E5E7EB] font-medium">
                {getTransactionLabel(transaction.type, transaction.description)}
              </p>
              <p className="text-sm text-[#9CA3AF]">
                {formatDate(transaction.createdAt)}
              </p>
            </div>
            <div className="text-right">
              <p
                className={`font-bold ${
                  transaction.amount > 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {transaction.amount > 0 ? "+" : ""}
                {transaction.amount} points
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
