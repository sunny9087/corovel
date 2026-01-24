"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, CheckSquare, Clock, UserPlus, User, X, Menu } from "lucide-react";
import LogoutButton from "./LogoutButton";
import Icon from "./ui/Icon";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Daily Actions", href: "/dashboard/tasks", icon: CheckSquare },
  { name: "Timeline", href: "/dashboard/leaderboard", icon: Clock },
  { name: "Invite", href: "/dashboard/referral", icon: UserPlus },
  { name: "Profile", href: "/dashboard/profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <Icon icon={isOpen ? X : Menu} size="lg" />
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
          <p className="text-xs text-[#9CA3AF] mt-1">Personal Operating System</p>
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
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                      isActive
                        ? "bg-primary-500 text-white shadow-lg"
                        : "text-gray-400 hover:bg-gray-700 hover:text-white"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <Icon icon={item.icon} size="md" />
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
