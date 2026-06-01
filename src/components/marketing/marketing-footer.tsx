import Link from "next/link";

import { SkillSwapLogo } from "@/components/branding/skillswap-logo";
import { Separator } from "@/components/ui/separator";

export function MarketingFooter() {
  return (
    <footer className="bg-background border-t">
      <div className="max-w-wide mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <SkillSwapLogo href="/" imageClassName="h-auto w-40" />
          <nav aria-label="Footer navigation" className="text-muted-foreground flex gap-4 text-sm">
            <Link className="hover:text-foreground" href="/sign-in">
              Auth
            </Link>
            <Link className="hover:text-foreground" href="/dashboard">
              Dashboard
            </Link>
          </nav>
        </div>
        <Separator className="my-6" />
        <p className="text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} SkillSwap. Architecture foundation for future MVP
          features.
        </p>
      </div>
    </footer>
  );
}
