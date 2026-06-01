"use client";

import { useEffect } from "react";

import { ErrorFallback } from "@/components/shared/error-fallback";
import { logger } from "@/lib/helpers/logger";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Route error boundary captured an error", { digest: error.digest, error });
  }, [error]);

  return <ErrorFallback reset={reset} title="Something went wrong" />;
}
