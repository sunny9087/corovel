"use client";

export function CardSkeleton() {
  return (
    <div className="bg-[#111827] rounded-xl p-6 border border-[#1F2937] animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-lg shimmer"></div>
          <div className="space-y-2">
            <div className="h-4 w-32 rounded shimmer"></div>
            <div className="h-3 w-24 rounded shimmer"></div>
          </div>
        </div>
        <div className="h-8 w-16 rounded shimmer"></div>
      </div>
      <div className="h-10 w-full rounded-lg shimmer"></div>
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="bg-[#111827] rounded-xl p-6 border border-[#1F2937] animate-fade-in">
      <div className="h-7 w-32 rounded shimmer mb-4"></div>
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#1F2937]/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded shimmer"></div>
              <div className="h-4 w-32 rounded shimmer"></div>
            </div>
            <div className="h-6 w-16 rounded shimmer"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="bg-[#111827] rounded-xl p-6 border border-[#1F2937] animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-lg shimmer"></div>
          <div>
            <div className="h-5 w-32 rounded shimmer mb-2"></div>
            <div className="h-4 w-24 rounded shimmer"></div>
          </div>
        </div>
        <div className="text-right">
          <div className="h-8 w-16 rounded shimmer mb-1"></div>
          <div className="h-3 w-12 rounded shimmer"></div>
        </div>
      </div>
      <div className="h-10 w-full rounded-lg shimmer"></div>
    </div>
  );
}
