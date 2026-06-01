import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublicConfig } from "@/lib/constants/env";
import type { Database } from "@/lib/supabase/types";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createClient() {
  const { anonKey, url } = getSupabasePublicConfig();

  if (!browserClient) {
    browserClient = createBrowserClient<Database>(url, anonKey);
  }

  return browserClient;
}
