"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const navItems = [
  { href: "/", label: "Play", icon: "chess" },
  { href: "/puzzles", label: "Puzzles", icon: "extension" },
  { href: "/analysis", label: "Analysis", icon: "analytics" },
  { href: "/learn", label: "Learn", icon: "school" },
  { href: "/stats", label: "Stats", icon: "query_stats" },
];

const Sidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const elo = (user as any)?.elo ?? 1200;

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[220px] lg:w-[240px] xl:w-[260px] flex-col bg-[#0e0e0e] border-r border-white/5 z-40">
      <div className="flex items-center gap-3 px-6 h-16 border-b border-white/5 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-white to-neutral-500 p-px">
          <div className="w-full h-full bg-[#0e0e0e] rounded-lg flex items-center justify-center">
            <span
              className="material-symbols-outlined text-white text-lg"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              chess
            </span>
          </div>
        </div>
        <span className="text-sm font-black tracking-tight text-white">GM</span>
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-3 py-6 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-neutral-500 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/5 p-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-white/5 transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-neutral-800 overflow-hidden shrink-0">
            {user?.image ? (
              <img src={user.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-neutral-500 text-lg">person</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.name || "Guest"}
            </p>
            <p className="text-[11px] text-neutral-500 font-medium">{elo}</p>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              signOut({ callbackUrl: "/login" });
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-neutral-500 hover:text-white"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
          </button>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
