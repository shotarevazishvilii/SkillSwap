"use client";

import { LogOut, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { logoutAction } from "@/features/auth/actions";
import { dashboardPageTitles } from "@/lib/constants/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatInitials } from "@/lib/utils";

type ProfilePreview = {
  avatarUrl: string | null;
  displayName: string;
  email: string | null;
};

function getPageTitle(pathname: string) {
  const title = dashboardPageTitles[pathname as keyof typeof dashboardPageTitles];

  return title ?? "Dashboard";
}

export function DashboardTopbar() {
  const pathname = usePathname();
  const pageTitle = useMemo(() => getPageTitle(pathname), [pathname]);
  const [profile, setProfile] = useState<ProfilePreview | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (isMounted) {
            setProfile(null);
          }
          return;
        }

        const { data } = await supabase
          .from("profiles")
          .select("avatar_url, full_name, username")
          .eq("id", user.id)
          .maybeSingle();

        if (isMounted) {
          setProfile({
            avatarUrl: data?.avatar_url ?? null,
            displayName: data?.full_name ?? data?.username ?? user.email ?? "SkillSwap member",
            email: user.email ?? null,
          });
        }
      } catch {
        if (isMounted) {
          setProfile({ avatarUrl: null, displayName: "SkillSwap member", email: null });
        }
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const avatarLabel = profile?.displayName ?? profile?.email ?? "SkillSwap member";

  return (
    <header className="bg-background/90 sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button className="lg:hidden" size="icon" variant="ghost">
              <Menu aria-hidden="true" className="size-5" />
              <span className="sr-only">Open dashboard navigation</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="p-0" side="left">
            <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
            <DashboardSidebar className="flex min-h-full border-r-0" closeOnNavigate />
          </SheetContent>
        </Sheet>
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold tracking-tight sm:text-lg">
            {pageTitle}
          </h1>
          <p className="text-muted-foreground hidden text-xs sm:block">
            {profile?.displayName ?? "Navigate your SkillSwap workspace"}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <form action={logoutAction}>
          <Button size="sm" type="submit" variant="ghost">
            <LogOut aria-hidden="true" className="size-4" />
            <span className="hidden sm:inline">Logout</span>
            <span className="sr-only sm:hidden">Logout</span>
          </Button>
        </form>
        {isLoadingProfile ? (
          <Skeleton className="size-10 rounded-full" />
        ) : (
          <Avatar aria-label={`${avatarLabel} account`}>
            {profile?.avatarUrl ? <AvatarImage alt="" src={profile.avatarUrl} /> : null}
            <AvatarFallback>{formatInitials(avatarLabel)}</AvatarFallback>
          </Avatar>
        )}
      </div>
    </header>
  );
}
