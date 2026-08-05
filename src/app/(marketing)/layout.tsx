import PageTransition from "@/components/layouts/PageTransition";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
    return <PageTransition>{children}</PageTransition>;
}
