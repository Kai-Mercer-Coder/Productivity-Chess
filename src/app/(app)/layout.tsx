import SidebarLayout from "@/components/layouts/SidebarLayout";
import OnboardingOverlay from "@/components/profile/OnboardingOverlay";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <SidebarLayout>{children}</SidebarLayout>
            <OnboardingOverlay />
        </>
    );
}
