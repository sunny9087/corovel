/**
 * Corovel Token Badge - Highlights Corovel as a token
 */
"use client";

import { Coins, Sparkles } from "lucide-react";
import Icon from "./ui/Icon";
import { cn } from "@/lib/utils";

interface CorovelTokenBadgeProps {
  variant?: "default" | "large" | "compact";
  className?: string;
  animated?: boolean;
}

export default function CorovelTokenBadge({ 
  variant = "default", 
  className,
  animated = true 
}: CorovelTokenBadgeProps) {
  const sizeClasses = {
    default: "px-4 py-2 text-sm",
    large: "px-6 py-3 text-base md:text-lg",
    compact: "px-2 py-1 text-xs",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full",
        "bg-gradient-to-r from-primary-500 via-purple-500 to-accent-500",
        "text-white font-semibold shadow-lg",
        animated && "animate-pulse-glow",
        sizeClasses[variant],
        className
      )}
    >
      <Icon icon={Coins} size="sm" className="text-yellow-300" />
      <span className="flex items-center gap-1">
        <span>COROVEL</span>
        <Icon icon={Sparkles} size="xs" className="text-yellow-300" />
      </span>
      <span className="text-xs opacity-90 font-normal">TOKEN</span>
    </div>
  );
}

