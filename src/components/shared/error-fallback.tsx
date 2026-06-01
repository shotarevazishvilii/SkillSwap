"use client";

import { AlertTriangle } from "lucide-react";

import { SkillSwapLogo } from "@/components/branding/skillswap-logo";
import { Button } from "@/components/ui/button";

export function ErrorFallback({
  reset,
  title = "Something went wrong",
}: {
  reset?: () => void;
  title?: string;
}) {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <SkillSwapLogo className="mb-8 justify-center" imageClassName="h-auto w-56" />
      <div className="bg-destructive/10 text-destructive mb-4 rounded-full p-3">
        <AlertTriangle aria-hidden="true" className="size-6" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground mt-3 text-sm leading-6">
        We could not complete this request. Please try again, or return later if the issue persists.
      </p>
      {reset ? (
        <Button className="mt-6" onClick={reset}>
          Try again
        </Button>
      ) : null}
    </section>
  );
}
