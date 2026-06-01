import { z } from "zod";

export const learningRequestFormSchema = z.object({
  message: z.string().trim().max(500, "Message must be 500 characters or less").optional(),
  skillId: z.string().uuid("Choose a skill"),
});

export type LearningRequestFormInput = z.infer<typeof learningRequestFormSchema>;
