/**
 * Card Component - Standardized card with variants
 */
import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "premium" | "glass" | "outline";
  hover?: boolean;
  glow?: boolean;
  children: ReactNode;
}

const variantStyles = {
  default: "bg-white border border-gray-200",
  premium: "bg-white/90 backdrop-blur-20 border border-black/5 shadow-sm",
  glass: "bg-gray-800/70 backdrop-blur-20 border border-white/10",
  outline: "bg-transparent border-2 border-gray-200",
};

export default function Card({
  variant = "default",
  hover = false,
  glow = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-4 md:p-6 transition-all duration-300",
        variantStyles[variant],
        hover && "hover:shadow-md hover:scale-[1.02] cursor-pointer",
        glow && "card-glow",
        className
      )}
      {...props}
    >
      {variant === "premium" && (
        <div className="premium-card-content relative z-10">
          {children}
        </div>
      )}
      {variant !== "premium" && children}
    </div>
  );
}

