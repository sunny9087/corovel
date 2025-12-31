"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1F2937] text-white rounded-lg shadow-lg"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 bg-[#1F2937] min-h-screen fixed left-0 top-0 flex flex-col border-r border-[#374151] z-40
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-[#374151]">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Image src="/corovel-logo.png" alt="Corovel Logo" width={36} height={36} className="rounded-lg" />
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
                    onClick={() => setIsOpen(false)}
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
    </>
  );
}
