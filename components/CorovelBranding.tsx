/**
 * Corovel Branding Component - Token branding graphics
 */
"use client";

import { Coins, TrendingUp, Zap, Sparkles } from "lucide-react";
import Icon from "./ui/Icon";
import { cn } from "@/lib/utils";

interface CorovelBrandingProps {
  variant?: "hero" | "header" | "badge" | "floating";
  className?: string;
}

export default function CorovelBranding({ variant = "header", className }: CorovelBrandingProps) {
  if (variant === "hero") {
    return (
      <div className={cn("relative", className)}>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-purple-500/20 to-accent-500/20 rounded-3xl blur-3xl animate-pulse" />
        <div className="relative bg-gradient-to-br from-primary-600 via-purple-600 to-accent-600 rounded-3xl p-6 md:p-10 text-white overflow-hidden border-2 border-primary-400/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-500/20 rounded-full -ml-24 -mb-24 animate-pulse" style={{ animationDelay: "1s" }} />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm animate-token-float">
                <Icon icon={Coins} size="lg" className="text-yellow-300" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                  COROVEL
                  <Icon icon={Sparkles} size="sm" className="text-yellow-300 animate-pulse" />
                  <span className="text-lg md:text-xl text-yellow-300 font-normal">TOKEN</span>
                </h2>
                <p className="text-primary-100 text-sm md:text-base">Native Token Ecosystem</p>
              </div>
            </div>
            <p className="text-base md:text-lg text-white/90 mb-6">
              Earn Corovel tokens by building momentum. Every action you log contributes to your token balance and helps you track your progress.
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                <Icon icon={TrendingUp} size="sm" />
                <span className="text-sm font-medium">Track Progress</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                <Icon icon={Zap} size="sm" />
                <span className="text-sm font-medium">Earn Tokens</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                <Icon icon={Coins} size="sm" />
                <span className="text-sm font-medium">Build Balance</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "floating") {
    return (
      <div className={cn("fixed bottom-6 right-6 z-50", className)}>
        <div className="bg-gradient-to-r from-primary-500 to-purple-500 rounded-full p-4 shadow-2xl animate-float">
          <div className="flex items-center gap-2 text-white">
            <Icon icon={Coins} size="md" className="text-yellow-300" />
            <div className="text-sm font-bold">
              <div>COROVEL</div>
              <div className="text-xs opacity-90">TOKEN</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div className="p-2 bg-gradient-to-r from-primary-500 to-purple-500 rounded-lg">
        <Icon icon={Coins} size="sm" className="text-white" />
      </div>
      <div>
        <div className="font-bold text-primary-600">COROVEL</div>
        <div className="text-xs text-gray-600">Token</div>
      </div>
    </div>
  );
}

