import type { MatchProfile, MatchRecommendation, MatchSkill } from "@/features/matching/types";

const SKILL_MATCH_POINTS = 40;
const RECIPROCAL_EXCHANGE_BONUS = 20;
const LOCATION_BONUS = 10;
const AVAILABILITY_BONUS = 10;
const MAX_SCORE = 100;
const MIN_SCORE = 0;

function normalize(value: string | null) {
  return value?.trim().toLowerCase() ?? "";
}

function intersectSkills(wantedSkills: MatchSkill[], teachingSkills: MatchSkill[]) {
  const teachingById = new Map(teachingSkills.map((skill) => [skill.id, skill]));

  return wantedSkills.flatMap((skill) => {
    const match = teachingById.get(skill.id);
    return match ? [match] : [];
  });
}

function uniqueSkills(skills: MatchSkill[]) {
  return Array.from(new Map(skills.map((skill) => [skill.id, skill])).values());
}

export function getCompatibilityLabel(score: number) {
  if (score >= 80) {
    return "Excellent Match";
  }

  if (score >= 60) {
    return "Good Match";
  }

  return "Potential Match";
}

export function calculateCompatibility(
  currentUser: MatchProfile,
  candidate: MatchProfile,
): MatchRecommendation {
  const candidateTeachesWhatCurrentWants = intersectSkills(
    currentUser.learningSkills,
    candidate.teachingSkills,
  );
  const currentTeachesWhatCandidateWants = intersectSkills(
    candidate.learningSkills,
    currentUser.teachingSkills,
  );
  const hasReciprocalExchange =
    candidateTeachesWhatCurrentWants.length > 0 && currentTeachesWhatCandidateWants.length > 0;
  const sameLocation =
    normalize(currentUser.location).length > 0 &&
    normalize(currentUser.location) === normalize(candidate.location);
  const sameAvailability =
    normalize(currentUser.availability).length > 0 &&
    normalize(currentUser.availability) === normalize(candidate.availability);

  let score =
    (candidateTeachesWhatCurrentWants.length + currentTeachesWhatCandidateWants.length) *
    SKILL_MATCH_POINTS;

  if (hasReciprocalExchange) {
    score += RECIPROCAL_EXCHANGE_BONUS;
  }

  if (sameLocation) {
    score += LOCATION_BONUS;
  }

  if (sameAvailability) {
    score += AVAILABILITY_BONUS;
  }

  const matchingSkills = uniqueSkills([
    ...candidateTeachesWhatCurrentWants,
    ...currentTeachesWhatCandidateWants,
  ]);
  const explanations = [
    ...candidateTeachesWhatCurrentWants.map(
      (skill) => `${candidate.fullName} teaches ${skill.name} and you want to learn ${skill.name}.`,
    ),
    ...currentTeachesWhatCandidateWants.map(
      (skill) => `You teach ${skill.name} and ${candidate.fullName} wants to learn ${skill.name}.`,
    ),
  ];

  if (hasReciprocalExchange) {
    explanations.push("You can teach each other different skills.");
  }

  if (sameLocation) {
    explanations.push("You share the same location.");
  }

  if (sameAvailability) {
    explanations.push("You share similar availability.");
  }

  const candidateCanMentorCurrentUser = candidateTeachesWhatCurrentWants.length > 0;

  return {
    candidate,
    explanations,
    learnerId: candidateCanMentorCurrentUser ? currentUser.id : candidate.id,
    matchingSkills,
    mentorId: candidateCanMentorCurrentUser ? candidate.id : currentUser.id,
    score: Math.max(MIN_SCORE, Math.min(MAX_SCORE, score)),
  };
}
