"use client";

import { ViewTransition } from "react";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";
import Sidebar from "./Sidebar";
import MobileNavbar from "./MobileNavbar";

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { isCollapsed } = useSidebar();

    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            <Sidebar />
            <MobileNavbar />
            <main
                className={`transition-all duration-300 min-h-screen ${
                    isCollapsed
                        ? "md:ml-[68px]"
                        : "md:ml-[220px] lg:ml-[240px] xl:ml-[260px]"
                }`}
            >
                <ViewTransition name="page" enter="fade" exit="fade" default="none">
                    <div key={pathname}>{children}</div>
                </ViewTransition>
            </main>
        </div>
    );
}
