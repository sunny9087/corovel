/**
 * Icon Component - Wrapper for Lucide React icons
 * Provides consistent sizing and styling
 */
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconProps {
  icon: LucideIcon;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
  xl: "w-8 h-8",
};

export default function Icon({ icon: IconComponent, size = "md", className }: IconProps) {
  return <IconComponent className={cn(sizeMap[size], className)} />;
}

