"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "Tasks", href: "/dashboard/tasks", icon: "✅" },
  { name: "Leaderboard", href: "/dashboard/leaderboard", icon: "🏆" },
  { name: "Referral", href: "/dashboard/referral", icon: "🔗" },
  { name: "Profile", href: "/dashboard/profile", icon: "👤" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#1F2937] min-h-screen fixed left-0 top-0 flex flex-col border-r border-[#374151]">
      {/* Logo */}
      <div className="p-6 border-b border-[#374151]">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>✨</span>
          Corovel
        </h1>
        <p className="text-xs text-[#9CA3AF] mt-1">Habit Building</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href === "/dashboard" && pathname === "/dashboard");
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-[#6366F1] text-white shadow-lg"
                      : "text-[#9CA3AF] hover:bg-[#374151] hover:text-white"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-[#374151] mt-auto">
        <div className="w-full">
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
