import type { UserId } from "@/types/user";

export type ProfileId = string;
export type SkillId = string;

export interface SkillSummary {
  id: SkillId;
  name: string;
  slug: string;
}

export interface ProfileSummary {
  displayName: string;
  headline?: string;
  id: ProfileId;
  userId: UserId;
}
