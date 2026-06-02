import { getSupabaseErrorMessage } from "@/lib/helpers/supabase-errors";

export function getLearningRequestErrorMessage(error: unknown) {
  if (error && typeof error === "object") {
    const maybeError = error as { code?: unknown; message?: unknown };
    const code = typeof maybeError.code === "string" ? maybeError.code : "";
    const message = typeof maybeError.message === "string" ? maybeError.message.toLowerCase() : "";

    if (code === "23505" || message.includes("duplicate") || message.includes("unique")) {
      return "You already have a pending request for this user and skill.";
    }

    if (message.includes("permission") || message.includes("row-level security")) {
      return "You do not have permission to update this request.";
    }
  }

  return getSupabaseErrorMessage(error, "We could not complete this request. Please try again.");
}
