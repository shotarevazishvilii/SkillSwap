import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { getSupabasePublicConfig } from "@/lib/constants/env";
import type { Database } from "@/lib/supabase/types";

export async function createClient() {
  const cookieStore = await cookies();
  const { anonKey, url } = getSupabasePublicConfig();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, options, value }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies; middleware handles session refreshes.
        }
      },
    },
  });
}
