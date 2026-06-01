import type { Tables } from "@/lib/supabase/types";

export type MarketplaceProfileRow = Pick<
  Tables<"profiles">,
  "avatar_url" | "bio" | "full_name" | "id" | "location" | "username"
>;

export type MarketplaceSkillRow = Pick<Tables<"skills">, "id" | "name" | "slug">;

export type MarketplaceTeachingSkillRow = Pick<
  Tables<"user_teaching_skills">,
  "experience_level" | "id" | "skill_id" | "user_id"
>;

export type MarketplaceLearningSkillRow = Pick<
  Tables<"user_learning_skills">,
  "id" | "skill_id" | "target_level" | "user_id"
>;

export type MarketplaceSkill = {
  id: string;
  level: string;
  name: string;
  skillId: string;
};

export type MarketplaceUser = {
  avatarUrl: string | null;
  bio: string | null;
  fullName: string;
  id: string;
  learningSkills: MarketplaceSkill[];
  location: string | null;
  teachingSkills: MarketplaceSkill[];
  username: string;
};
