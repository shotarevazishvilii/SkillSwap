"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { SkillSwapLogo } from "@/components/branding/skillswap-logo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { logoutAction } from "@/features/auth/actions";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const unauthenticatedLinks = [
  { href: "/", label: "Home" },
  { href: "/auth/sign-in", label: "Sign In" },
  { href: "/auth/sign-up", label: "Sign Up" },
] as const;

const authenticatedLinks = [{ href: "/dashboard", label: "Dashboard" }] as const;

export function MarketingNavbar() {
  const pathname = usePathname();
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

  const visibleLinks = isAuthenticated ? authenticatedLinks : unauthenticatedLinks;

  return (
    <header className="bg-background/90 sticky top-0 z-40 border-b backdrop-blur">
      <nav
        aria-label="Primary navigation"
        className="max-w-wide mx-auto flex h-16 w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      >
        <SkillSwapLogo href="/" imageClassName="h-auto w-40" />
        <div className="flex items-center gap-2 sm:gap-3">
          {isCheckingAuth ? (
            <Skeleton className="h-9 w-48" />
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
                {visibleLinks.map((link) => {
                  const isActive = pathname === link.href;

                  return (
                    <Link
                      key={link.href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "hover:text-foreground rounded-md px-2 py-2 text-sm font-medium transition-colors sm:px-3",
                        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                      )}
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
              {isAuthenticated ? (
                <form action={logoutAction}>
                  <Button size="sm" type="submit" variant="outline">
                    Logout
                  </Button>
                </form>
              ) : null}
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
