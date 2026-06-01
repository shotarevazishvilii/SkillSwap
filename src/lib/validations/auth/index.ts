import { z } from "zod";

export const emailSchema = z.string().trim().email();

export const passwordSchema = z
  .string()
  .min(8)
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[0-9]/, "Password must include a number");

export const authCredentialsSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
