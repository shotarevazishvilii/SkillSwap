import { z } from "zod";

export const matchScoreSchema = z.number().min(0).max(100);
export const matchingIntentSchema = z.enum(["teach", "learn"]);
