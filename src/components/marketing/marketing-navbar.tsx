import Link from "next/link";

import { SkillSwapLogo } from "@/components/branding/skillswap-logo";
import { Button } from "@/components/ui/button";

const marketingLinks = [
  { href: "/", label: "Home" },
  { href: "/sign-in", label: "Sign in" },
] as const;

export function MarketingNavbar() {
  return (
    <header className="bg-background/90 sticky top-0 z-40 border-b backdrop-blur">
      <nav
        aria-label="Primary navigation"
        className="max-w-wide mx-auto flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        <SkillSwapLogo href="/" imageClassName="h-auto w-40" />
        <div className="hidden items-center gap-6 md:flex">
          {marketingLinks.map((link) => (
            <Link
              key={link.href}
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <Button asChild size="sm">
          <Link href="/sign-in">Get started</Link>
        </Button>
      </nav>
    </header>
  );
}
