"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { SkillSwapLogo } from "@/components/branding/skillswap-logo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { logoutAction } from "@/features/auth/actions";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/auth/sign-in", label: "Sign in" },
  { href: "/auth/sign-up", label: "Sign up" },
] as const;

export function MarketingNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (isMounted) {
          setIsAuthenticated(Boolean(session));
        }
      } catch {
        if (isMounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    }

    void checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleLinks = isAuthenticated
    ? [publicLinks[0], { href: "/dashboard", label: "Dashboard" }]
    : publicLinks;

  return (
    <header className="bg-background/90 sticky top-0 z-40 border-b backdrop-blur">
      <nav
        aria-label="Primary navigation"
        className="max-w-wide mx-auto flex h-16 w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      >
        <SkillSwapLogo href="/" imageClassName="h-auto w-40" />
        <div className="ml-auto hidden items-center gap-2 md:flex">
          {visibleLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                )}
                href={link.href}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          {isCheckingAuth ? (
            <Skeleton className="h-9 w-24" />
          ) : isAuthenticated ? (
            <form action={logoutAction}>
              <Button size="sm" type="submit" variant="outline">
                Logout
              </Button>
            </form>
          ) : (
            <Button asChild size="sm">
              <Link href="/auth/sign-up">Sign up</Link>
            </Button>
          )}
          <Button
            className="md:hidden"
            size="sm"
            type="button"
            variant="ghost"
            onClick={() => router.push(isAuthenticated ? "/dashboard" : "/auth/sign-in")}
          >
            {isAuthenticated ? "Dashboard" : "Sign in"}
          </Button>
        </div>
      </nav>
    </header>
  );
}
