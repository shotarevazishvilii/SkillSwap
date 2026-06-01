import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNavbar } from "@/components/marketing/marketing-navbar";

export default function MarketingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <MarketingNavbar />
      <main className="flex-1" id="main-content">
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
}
