"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SkillSwapLogo } from "@/components/branding/skillswap-logo";
import { Separator } from "@/components/ui/separator";
import { dashboardNavigationItems } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";

function isActiveRoute(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside className={cn("bg-background min-h-screen flex-col border-r", className)}>
      <div className="flex h-16 items-center px-6">
        <SkillSwapLogo href="/dashboard" imageClassName="h-auto w-40" />
      </div>
      <Separator />
      <nav aria-label="Dashboard navigation" className="flex-1 space-y-1 px-3 py-4">
        {dashboardNavigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(pathname, item.href);

          return (
            <Link
              key={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
              href={item.href}
            >
              <Icon aria-hidden="true" className="size-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
