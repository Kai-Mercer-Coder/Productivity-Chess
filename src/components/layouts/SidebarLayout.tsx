"use client";

import { useSidebar } from "./SidebarContext";
import Sidebar from "./Sidebar";
import MobileNavbar from "./MobileNavbar";
import PageTransition from "./PageTransition";

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
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
                <PageTransition>{children}</PageTransition>
            </main>
        </div>
    );
}
