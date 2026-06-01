import { getErrorMessage } from "@/lib/helpers/errors";

import type { z } from "zod";

export type ActionResult<TData> =
  | { data: TData; ok: true }
  | { error: string; fieldErrors?: Record<string, string[]>; ok: false };

export function parseActionInput<TSchema extends z.ZodType>(schema: TSchema, input: unknown) {
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(
      Object.entries(parsed.error.flatten().fieldErrors).filter(
        (entry): entry is [string, string[]] => Array.isArray(entry[1]),
      ),
    );

    return {
      error: "Invalid input",
      fieldErrors,
      ok: false,
    } satisfies ActionResult<never>;
  }

  return { data: parsed.data as z.infer<TSchema>, ok: true } satisfies ActionResult<
    z.infer<TSchema>
  >;
}

export function toActionError(error: unknown) {
  return { error: getErrorMessage(error), ok: false } satisfies ActionResult<never>;
}
