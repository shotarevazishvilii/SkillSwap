import {
  getSupabaseErrorMessage,
  normalizeSupabaseError,
} from "@/lib/helpers/supabase-errors";

export function getProfileErrorMessage(error: unknown) {
  const normalizedError = normalizeSupabaseError(error);
  const message = normalizedError.message?.toLowerCase() ?? "";

  if (
    normalizedError.code === "23505" ||
    message.includes("duplicate") ||
    message.includes("unique")
  ) {
    if (message.includes("username")) {
      return "That username is already taken. Choose another one.";
    }

    return "This skill is already on your profile.";
  }

  return getSupabaseErrorMessage(error, "We could not save your changes. Please try again.");
}

export function getProfileLoadErrorMessage(error: unknown) {
  return getSupabaseErrorMessage(error, "We could not load your profile right now. Please try again.");
}
