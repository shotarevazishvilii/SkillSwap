import { z } from "zod";

export const profileIdSchema = z.string().uuid();
export const skillNameSchema = z.string().trim().min(2).max(80);

export const profileFormSchema = z.object({
  availability: z
    .string()
    .trim()
    .max(160, "Availability must be 160 characters or less")
    .optional(),
  avatarUrl: z.string().trim().url("Enter a valid URL").or(z.literal("")).optional(),
  bio: z.string().trim().max(500, "Bio must be 500 characters or less").optional(),
  fullName: z.string().trim().min(1, "Full name is required").max(100, "Full name is too long"),
  location: z.string().trim().max(120, "Location must be 120 characters or less").optional(),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be 30 characters or less")
    .regex(/^[a-zA-Z0-9_]+$/, "Use only letters, numbers, and underscores"),
});

export const teachingSkillFormSchema = z.object({
  experienceLevel: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  skillId: z.string().uuid("Choose a skill"),
});

export const learningSkillFormSchema = z.object({
  skillId: z.string().uuid("Choose a skill"),
  targetLevel: z.enum(["beginner", "intermediate", "advanced"]),
});

export type LearningSkillFormInput = z.infer<typeof learningSkillFormSchema>;
export type ProfileFormInput = z.infer<typeof profileFormSchema>;
export type TeachingSkillFormInput = z.infer<typeof teachingSkillFormSchema>;
