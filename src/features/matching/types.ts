export type MatchSkill = {
  id: string;
  name: string;
};

export type MatchProfile = {
  availability: string | null;
  avatarUrl: string | null;
  bio: string | null;
  fullName: string;
  id: string;
  learningSkills: MatchSkill[];
  location: string | null;
  teachingSkills: MatchSkill[];
  username: string;
};

export type MatchRecommendation = {
  candidate: MatchProfile;
  explanations: string[];
  learnerId: string;
  matchingSkills: MatchSkill[];
  mentorId: string;
  score: number;
};
