"use client";

import { useEffect } from "react";

import { ErrorFallback } from "@/components/shared/error-fallback";
import { logger } from "@/lib/helpers/logger";

import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Global error boundary captured an error", { digest: error.digest, error });
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen items-center justify-center p-6">
          <ErrorFallback reset={reset} title="SkillSwap could not load" />
        </main>
      </body>
    </html>
  );
}
