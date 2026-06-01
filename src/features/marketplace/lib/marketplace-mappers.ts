import type {
  MarketplaceLearningSkillRow,
  MarketplaceProfileRow,
  MarketplaceSkill,
  MarketplaceSkillRow,
  MarketplaceTeachingSkillRow,
  MarketplaceUser,
} from "@/features/marketplace/types";

export function formatLevel(level: string) {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

function mapSkill(skillId: string, level: string, skillsById: Map<string, MarketplaceSkillRow>) {
  return {
    id: `${skillId}-${level}`,
    level,
    name: skillsById.get(skillId)?.name ?? "Unknown skill",
    skillId,
  } satisfies MarketplaceSkill;
}

export function buildMarketplaceUsers({
  learningRows,
  profiles,
  skills,
  teachingRows,
}: {
  learningRows: MarketplaceLearningSkillRow[];
  profiles: MarketplaceProfileRow[];
  skills: MarketplaceSkillRow[];
  teachingRows: MarketplaceTeachingSkillRow[];
}) {
  const skillsById = new Map(skills.map((skill) => [skill.id, skill]));
  const teachingByUserId = new Map<string, MarketplaceSkill[]>();
  const learningByUserId = new Map<string, MarketplaceSkill[]>();

  teachingRows.forEach((row) => {
    const current = teachingByUserId.get(row.user_id) ?? [];
    current.push(mapSkill(row.skill_id, row.experience_level, skillsById));
    teachingByUserId.set(row.user_id, current);
  });

  learningRows.forEach((row) => {
    const current = learningByUserId.get(row.user_id) ?? [];
    current.push(mapSkill(row.skill_id, row.target_level, skillsById));
    learningByUserId.set(row.user_id, current);
  });

  return profiles
    .filter((profile) => Boolean(profile.full_name?.trim()))
    .map((profile) => ({
      avatarUrl: profile.avatar_url,
      bio: profile.bio,
      fullName: profile.full_name?.trim() ?? "SkillSwap member",
      id: profile.id,
      learningSkills: learningByUserId.get(profile.id) ?? [],
      location: profile.location,
      teachingSkills: teachingByUserId.get(profile.id) ?? [],
      username: profile.username?.trim() || "member",
    }))
    .filter((user): user is MarketplaceUser => user.teachingSkills.length > 0);
}
