import type { ProfileId } from "@/types/profile";
import type { SessionId } from "@/types/session";

export type ReviewId = string;

export interface ReviewSummary {
  id: ReviewId;
  rating: 1 | 2 | 3 | 4 | 5;
  revieweeId: ProfileId;
  reviewerId: ProfileId;
  sessionId: SessionId;
}
