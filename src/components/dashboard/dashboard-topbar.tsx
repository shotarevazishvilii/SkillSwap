import { Menu } from "lucide-react";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function DashboardTopbar() {
  return (
    <header className="bg-background/90 sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button className="lg:hidden" size="icon" variant="ghost">
              <Menu aria-hidden="true" className="size-5" />
              <span className="sr-only">Open dashboard navigation</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="p-0" side="left">
            <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
            <DashboardSidebar className="flex min-h-full border-r-0" />
          </SheetContent>
        </Sheet>
        <div>
          <p className="text-muted-foreground text-sm font-medium">SkillSwap dashboard</p>
          <p className="text-muted-foreground text-xs">Future learner and mentor workspace</p>
        </div>
      </div>
      <Avatar aria-label="User menu placeholder">
        <AvatarFallback>SS</AvatarFallback>
      </Avatar>
    </header>
  );
}
