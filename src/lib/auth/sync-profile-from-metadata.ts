import type { Database } from "@/lib/supabase/types";

import type { SupabaseClient, User } from "@supabase/supabase-js";

export function getFullNameFromUserMetadata(user: User) {
  const metadata = user.user_metadata;
  const rawName =
    typeof metadata?.full_name === "string"
      ? metadata.full_name
      : typeof metadata?.fullName === "string"
        ? metadata.fullName
        : "";

  const trimmed = rawName.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function syncProfileFullNameFromMetadata(
  supabase: SupabaseClient<Database>,
  user: User,
) {
  const fullName = getFullNameFromUserMetadata(user);

  if (!fullName) {
    return;
  }

  await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id).is("full_name", null);
}
