import { getUserPointTransactions } from "@/lib/auth";
import { requireAuth } from "@/lib/auth-utils";

export default async function PointsHistory() {
  const user = await requireAuth();
  const transactions = await getUserPointTransactions(user.id, 20);

  if (transactions.length === 0) {
    return (
      <div className="bg-[#111827] rounded-xl border border-[#1F2937] p-4 md:p-6 mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-[#E5E7EB] mb-3 md:mb-4">
          Activity History
        </h2>
        <p className="text-sm md:text-base text-[#9CA3AF]">No activity yet. Start logging actions to see your history.</p>
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
        return "Daily Action";
      case "referral_signup":
        return "Invite Bonus";
      case "referral_reward":
        return "Invite Reward";
      case "profile_completion":
        return "Setup Complete";
      case "weekly_challenge":
        return "Weekly Momentum";
      case "manual":
        return "Adjustment";
      default:
        return "Progress";
    }
  };

  return (
    <div className="bg-[#111827] rounded-xl border border-[#1F2937] p-4 md:p-6 mb-4 md:mb-6">
      <h2 className="text-lg md:text-xl font-semibold text-[#E5E7EB] mb-3 md:mb-4">
        Activity History
      </h2>
      <div className="space-y-2 md:space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex justify-between items-center py-2.5 md:py-3 border-b border-[#1F2937] last:border-0"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm md:text-base text-[#E5E7EB] font-medium truncate">
                {getTransactionLabel(transaction.type, transaction.description)}
              </p>
              <p className="text-xs md:text-sm text-[#9CA3AF]">
                {formatDate(transaction.createdAt)}
              </p>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <p
                className={`text-sm md:text-base font-bold ${
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
