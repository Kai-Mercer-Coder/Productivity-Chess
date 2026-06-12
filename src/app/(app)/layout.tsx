import SidebarLayout from "@/components/layouts/SidebarLayout";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return <SidebarLayout>{children}</SidebarLayout>;
}
