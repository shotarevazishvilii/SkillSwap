import type { ProfileSummary, SkillSummary } from "@/types/profile";

export type MatchId = string;

export interface MatchSummary {
  id: MatchId;
  learner: ProfileSummary;
  mentor: ProfileSummary;
  score: number;
  skill: SkillSummary;
}
