import { z } from "zod";

export const ratingSchema = z.number().int().min(1).max(5);
export const reviewCommentSchema = z.string().trim().max(2000);
