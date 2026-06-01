import { z } from "zod";

import { ConfigurationError } from "@/lib/helpers/errors";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
});

const serverEnvSchema = publicEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
});

const rawPublicEnv = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
};

const rawServerEnv = {
  ...rawPublicEnv,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

export const publicEnvValidation = publicEnvSchema.safeParse(rawPublicEnv);
export const serverEnvValidation = serverEnvSchema.safeParse(rawServerEnv);

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getPublicAppUrl() {
  return publicEnvValidation.success
    ? publicEnvValidation.data.NEXT_PUBLIC_APP_URL
    : "http://localhost:3000";
}

export function getSupabasePublicConfig() {
  if (!publicEnvValidation.success) {
    throw new ConfigurationError(
      "Supabase public environment variables are missing or invalid. Check .env.example.",
    );
  }

  return {
    anonKey: publicEnvValidation.data.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    url: publicEnvValidation.data.NEXT_PUBLIC_SUPABASE_URL,
  };
}

export function getServerEnv() {
  if (!serverEnvValidation.success) {
    throw new ConfigurationError(
      "Server environment variables are missing or invalid. Check .env.example.",
    );
  }

  return serverEnvValidation.data;
}
