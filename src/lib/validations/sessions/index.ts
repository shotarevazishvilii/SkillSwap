import { z } from "zod";

export const isoDateTimeSchema = z.string().datetime();
export const sessionStatusSchema = z.enum(["requested", "scheduled", "completed", "cancelled"]);
