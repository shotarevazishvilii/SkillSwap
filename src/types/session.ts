import type { ProfileId, SkillId } from "@/types/profile";

export type SessionId = string;
export type SessionStatus = "scheduled" | "completed" | "cancelled";

export interface SessionSummary {
  endsAt: string;
  id: SessionId;
  learnerId: ProfileId;
  mentorId: ProfileId;
  skillId: SkillId;
  startsAt: string;
  status: SessionStatus;
}
