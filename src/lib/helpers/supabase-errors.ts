import { ConfigurationError } from "@/lib/helpers/errors";

type SupabaseErrorLike = {
  code?: string | undefined;
  details?: string | undefined;
  hint?: string | undefined;
  message?: string | undefined;
};

export function normalizeSupabaseError(error: unknown): SupabaseErrorLike {
  if (error instanceof ConfigurationError) {
    return { message: error.message, code: "CONFIGURATION_ERROR" };
  }

  if (error && typeof error === "object") {
    const maybeError = error as {
      code?: unknown;
      details?: unknown;
      hint?: unknown;
      message?: unknown;
    };

    return {
      code: typeof maybeError.code === "string" ? maybeError.code : undefined,
      details: typeof maybeError.details === "string" ? maybeError.details : undefined,
      hint: typeof maybeError.hint === "string" ? maybeError.hint : undefined,
      message: typeof maybeError.message === "string" ? maybeError.message : undefined,
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return {};
}

export function isMissingDatabaseSetupError(error: unknown) {
  const normalized = normalizeSupabaseError(error);
  const message = normalized.message?.toLowerCase() ?? "";
  const details = normalized.details?.toLowerCase() ?? "";

  return (
    normalized.code === "CONFIGURATION_ERROR" ||
    normalized.code === "PGRST205" ||
    normalized.code === "42P01" ||
    message.includes("invalid api key") ||
    message.includes("failed to fetch") ||
    message.includes("fetch failed") ||
    message.includes("row-level security") ||
    (message.includes("relation") && message.includes("does not exist")) ||
    message.includes("could not find the table") ||
    details.includes("does not exist")
  );
}

export function getSupabaseSetupHelpMessage() {
  return "SkillSwap could not reach your Supabase database. Check your .env file, confirm the project URL and anon key, and run all SQL migrations in supabase/migrations/.";
}

export function getSupabaseErrorMessage(error: unknown, fallbackMessage: string) {
  const normalized = normalizeSupabaseError(error);
  const message = normalized.message?.toLowerCase() ?? "";

  if (isMissingDatabaseSetupError(error)) {
    return getSupabaseSetupHelpMessage();
  }

  if (message.includes("network")) {
    return "Network error. Check your connection and try again.";
  }

  if (message.includes("jwt") || message.includes("not authenticated")) {
    return "Your session expired. Please sign in again.";
  }

  if (message.includes("permission") || message.includes("row-level security")) {
    return "You do not have permission to perform this action.";
  }

  return fallbackMessage;
}
