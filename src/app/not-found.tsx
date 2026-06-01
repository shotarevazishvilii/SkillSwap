import Link from "next/link";

import { SkillSwapLogo } from "@/components/branding/skillswap-logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16" id="main-content">
      <section className="mx-auto max-w-lg text-center">
        <SkillSwapLogo className="mb-8 justify-center" imageClassName="h-auto w-56" />
        <p className="text-muted-foreground text-sm font-medium tracking-[0.2em] uppercase">404</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Page not found</h1>
        <p className="text-muted-foreground mt-4">
          The page you are looking for does not exist or may have moved.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">Return home</Link>
        </Button>
      </section>
    </main>
  );
}
