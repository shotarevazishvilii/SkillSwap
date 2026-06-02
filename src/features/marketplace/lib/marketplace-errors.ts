import { getSupabaseErrorMessage } from "@/lib/helpers/supabase-errors";

export function getMarketplaceErrorMessage(error?: unknown) {
  return getSupabaseErrorMessage(
    error,
    "We could not load the marketplace right now. Please try again.",
  );
}
