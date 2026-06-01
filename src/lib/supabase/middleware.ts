import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getSupabasePublicConfig } from "@/lib/constants/env";
import { getErrorMessage } from "@/lib/helpers/errors";
import { logger } from "@/lib/helpers/logger";
import type { Database } from "@/lib/supabase/types";

const authRedirectRoutes = new Set(["/auth/sign-in", "/auth/sign-up"]);

function redirectTo(request: NextRequest, pathname: string) {
  return NextResponse.redirect(new URL(pathname, request.url));
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAuthRedirectRoute = authRedirectRoutes.has(pathname);
  let response = NextResponse.next({ request });
  let isAuthenticated = false;

  try {
    const { anonKey, url } = getSupabasePublicConfig();
    const supabase = createServerClient<Database>(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, options, value }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    isAuthenticated = Boolean(user && !error);
  } catch (error) {
    logger.warn("Supabase middleware skipped session refresh", { error: getErrorMessage(error) });
  }

  if (isDashboardRoute && !isAuthenticated) {
    return redirectTo(request, "/auth/sign-in");
  }

  if (isAuthRedirectRoute && isAuthenticated) {
    return redirectTo(request, "/dashboard");
  }

  return response;
}
