import { SkillSwapLogo } from "@/components/branding/skillswap-logo";

export function MarketingFooter() {
  return (
    <footer className="bg-background border-t">
      <div className="max-w-wide mx-auto flex w-full flex-col items-center justify-between gap-4 px-4 py-8 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
        <SkillSwapLogo href="/" imageClassName="h-auto w-40" />
        <p className="text-muted-foreground text-sm">&copy; 2026 SkillSwap. All rights reserved.</p>
      </div>
    </footer>
  );
}
