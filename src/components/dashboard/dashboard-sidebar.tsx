import Link from "next/link";

import { SkillSwapLogo } from "@/components/branding/skillswap-logo";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { dashboardNavigationItems } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";

export function DashboardSidebar({ className }: { className?: string }) {
  return (
    <aside className={cn("bg-background min-h-screen flex-col border-r", className)}>
      <div className="flex h-16 items-center px-6">
        <SkillSwapLogo href="/dashboard" imageClassName="h-auto w-40" />
      </div>
      <Separator />
      <nav aria-label="Dashboard navigation" className="flex-1 space-y-1 px-3 py-4">
        {dashboardNavigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              aria-disabled={item.disabled}
              className={cn(
                "text-muted-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                item.disabled && "pointer-events-none opacity-60",
              )}
              href={item.href}
            >
              <Icon aria-hidden="true" className="size-4" />
              <span className="flex-1">{item.label}</span>
              {item.disabled ? <Badge variant="outline">Soon</Badge> : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
