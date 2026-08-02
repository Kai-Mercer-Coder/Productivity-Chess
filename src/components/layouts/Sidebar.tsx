"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import type { SessionWithProfile } from "@/types/profile";
import Link from 'next/link';
import { useSidebar } from "./SidebarContext";
import UserProfileOverlay from "@/components/profile/UserProfileOverlay";
import Image from "next/image"; // ⚡️ SQUEEZE: Avoid image flashing during fades

const navItems = [
  { href: "/play", label: "Play", icon: "chess" },
  { href: "/puzzles", label: "Puzzles", icon: "extension" },
  { href: "/analysis", label: "Analysis", icon: "analytics" },
  { href: "/learn", label: "Learn", icon: "school" },
  { href: "/variants", label: "Variants", icon: "shuffle" },
  { href: "/stats", label: "Stats", icon: "query_stats" },
];

const Sidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [profileOpen, setProfileOpen] = useState(false);
  const user = session?.user;
  const elo = (user as SessionWithProfile["user"])?.elo ?? 1200;

  return (
    <aside
      className={`hidden md:flex fixed left-0 top-0 bottom-0 flex-col bg-[#0e0e0e] border-r border-white/5 z-40 will-change-[width] transition-[width] duration-300 ${isCollapsed ? "w-[68px]" : "w-[220px] lg:w-[240px] xl:w-[260px]"
        }`}
      style={{
        viewTransitionName: 'main-sidebar',
        // ⚡️ SQUEEZE: Keeps sidebar isolated from page DOM changes completely
      }}
    >
      <Link href="/dashboard" className="flex items-center h-16 border-b border-white/5 shrink-0 px-4 hover:bg-white/5 transition-colors">
        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-white to-neutral-500 p-px shrink-0">
          <div className="w-full h-full bg-[#0e0e0e] rounded-lg flex items-center justify-center">
            <span
              className="material-symbols-outlined text-white text-lg"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              chess
            </span>
          </div>
        </div>
        {!isCollapsed && <span className="text-sm font-black tracking-tight text-white ml-3">GM</span>}
      </Link>

      <nav className="flex-1 flex flex-col gap-1 py-6 overflow-y-auto containment-layout">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === "/learn" && pathname.startsWith("/learn/")) || (item.href === "/stats" && pathname.startsWith("/stats/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true} // ⚡️ SQUEEZE: Instant preloading before user clicks
              className={`flex items-center mx-3 py-3 rounded-xl text-sm font-medium transition-colors ${isCollapsed ? "justify-center" : "gap-3 px-4"
                } ${isActive ? "bg-white/10 text-white" : "text-neutral-500 hover:text-white hover:bg-white/5"
                }`}
            >
              <span className="material-symbols-outlined text-xl shrink-0">{item.icon}</span>
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/5 p-3">
        <button
          type="button"
          onClick={() => setProfileOpen(true)}
          className={`w-full flex items-center py-2.5 rounded-xl hover:bg-white/5 transition-colors group text-left ${isCollapsed ? "justify-center px-0" : "gap-3 px-4"
            }`}
        >
          <div className="w-8 h-8 rounded-full bg-neutral-800 overflow-hidden shrink-0 relative">
            {user?.image ? (
              <Image
                src={user.image}
                alt=""
                fill
                sizes="32px"

                priority // ⚡️ SQUEEZE: Tells Next.js to lock this image in memory, preventing blink-outs during cross-fades
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-neutral-500 text-lg">person</span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name || "Guest"}</p>
                <p className="text-[11px] text-neutral-500 font-medium">{elo}</p>
              </div>
              <span className="material-symbols-outlined text-neutral-500 text-lg shrink-0">chevron_right</span>
            </>
          )}
        </button>
      </div>

      <button
        type="button"
        onClick={toggleSidebar}
        className={`absolute -right-3 top-16 w-6 h-6 bg-[#0e0e0e] border border-white/10 rounded-full flex items-center justify-center text-neutral-500 hover:text-white transition-transform hover:border-white/30 z-50 ${isCollapsed ? "rotate-180" : ""
          }`}
      >
        <span className="material-symbols-outlined text-sm">chevron_left</span>
      </button>

      <UserProfileOverlay open={profileOpen} onClose={() => setProfileOpen(false)} />
    </aside>
  );
};

export default Sidebar;
