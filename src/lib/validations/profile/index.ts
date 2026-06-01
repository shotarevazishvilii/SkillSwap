import { z } from "zod";

export const profileIdSchema = z.string().uuid();
export const skillNameSchema = z.string().trim().min(2).max(80);
