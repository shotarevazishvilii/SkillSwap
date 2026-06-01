import { z } from "zod";

import { getErrorMessage } from "@/lib/helpers/errors";

export type ActionResult<TData> =
  | { data: TData; ok: true }
  | { error: string; fieldErrors?: Record<string, string[]>; ok: false };

export function parseActionInput<TSchema extends z.ZodType>(schema: TSchema, input: unknown) {
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    return {
      error: "Invalid input",
      fieldErrors: parsed.error.flatten().fieldErrors,
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
