"use client";

import { Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  calculateCompatibility,
  getCompatibilityLabel,
} from "@/features/matching/lib/compatibility";
import type { MatchProfile, MatchRecommendation, MatchSkill } from "@/features/matching/types";
import { SendRequestDialog } from "@/features/requests/components/send-request-dialog";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types";
import { formatInitials } from "@/lib/utils";

type ProfileRow = Pick<
  Tables<"profiles">,
  "availability" | "avatar_url" | "bio" | "full_name" | "id" | "location" | "username"
>;
type SkillRow = Pick<Tables<"skills">, "id" | "name" | "slug">;
type TeachingRow = Pick<
  Tables<"user_teaching_skills">,
  "experience_level" | "id" | "skill_id" | "user_id"
>;
type LearningRow = Pick<
  Tables<"user_learning_skills">,
  "id" | "skill_id" | "target_level" | "user_id"
>;
type SavedMatchRow = Pick<Tables<"matches">, "id" | "learner_id" | "mentor_id">;

type MessageState = {
  text: string;
  type: "error" | "success";
};

const MINIMUM_VISIBLE_SCORE = 20;

function getMatchPairKey(firstUserId: string, secondUserId: string) {
  return [firstUserId, secondUserId].sort().join(":");
}

function getSkillRowsForUser<TSkillRow extends { skill_id: string; user_id: string }>(
  rows: TSkillRow[],
  skillsById: Map<string, SkillRow>,
  userId: string,
) {
  return rows
    .filter((row) => row.user_id === userId)
    .flatMap((row) => {
      const skill = skillsById.get(row.skill_id);
      return skill ? [{ id: skill.id, name: skill.name } satisfies MatchSkill] : [];
    });
}

function buildMatchProfile({
  learningRows,
  profile,
  skillsById,
  teachingRows,
}: {
  learningRows: LearningRow[];
  profile: ProfileRow;
  skillsById: Map<string, SkillRow>;
  teachingRows: TeachingRow[];
}) {
  return {
    availability: profile.availability,
    avatarUrl: profile.avatar_url,
    bio: profile.bio,
    fullName: profile.full_name ?? "SkillSwap member",
    id: profile.id,
    learningSkills: getSkillRowsForUser(learningRows, skillsById, profile.id),
    location: profile.location,
    teachingSkills: getSkillRowsForUser(teachingRows, skillsById, profile.id),
    username: profile.username ?? "unknown",
  } satisfies MatchProfile;
}

function getScoreVariant(score: number) {
  if (score >= 80) {
    return "success";
  }

  if (score >= 60) {
    return "secondary";
  }

  return "outline";
}

function MatchesLoadingState() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-96 w-full" />
      ))}
    </div>
  );
}

function getMatchErrorMessage(error: unknown) {
  if (error && typeof error === "object") {
    const maybeError = error as { code?: unknown; message?: unknown };
    const code = typeof maybeError.code === "string" ? maybeError.code : "";
    const message = typeof maybeError.message === "string" ? maybeError.message.toLowerCase() : "";

    if (code === "23505" || message.includes("duplicate") || message.includes("unique")) {
      return "This match has already been saved.";
    }
  }

  return "We could not save this match. Please try again.";
}

export function MatchesPage() {
  const [recommendations, setRecommendations] = useState<MatchRecommendation[]>([]);
  const [savedMatchKeys, setSavedMatchKeys] = useState<Set<string>>(new Set());
  const [savingMatchKey, setSavingMatchKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<MessageState | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMatches() {
      setIsLoading(true);
      setMessage(null);

      try {
        const supabase = createClient();
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          if (isMounted) {
            setMessage({ text: "Please sign in to view your matches.", type: "error" });
            setIsLoading(false);
          }
          return;
        }

        const [profilesResult, skillsResult, savedMatchesResult] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, full_name, username, avatar_url, bio, location, availability")
            .order("full_name"),
          supabase.from("skills").select("id, name, slug"),
          supabase
            .from("matches")
            .select("id, mentor_id, learner_id")
            .or(`mentor_id.eq.${user.id},learner_id.eq.${user.id}`),
        ]);

        if (profilesResult.error) {
          throw profilesResult.error;
        }
        if (skillsResult.error) {
          throw skillsResult.error;
        }
        if (savedMatchesResult.error) {
          throw savedMatchesResult.error;
        }

        const profiles = (profilesResult.data ?? []) as ProfileRow[];
        const currentProfile = profiles.find((profile) => profile.id === user.id);
        const otherProfiles = profiles.filter((profile) => profile.id !== user.id);

        if (!currentProfile) {
          if (isMounted) {
            setMessage({
              text: "Your profile is missing. Complete your profile before viewing matches.",
              type: "error",
            });
            setRecommendations([]);
          }
          return;
        }

        const profileIds = profiles.map((profile) => profile.id);
        const [teachingResult, learningResult] = await Promise.all([
          supabase
            .from("user_teaching_skills")
            .select("id, user_id, skill_id, experience_level")
            .in("user_id", profileIds),
          supabase
            .from("user_learning_skills")
            .select("id, user_id, skill_id, target_level")
            .in("user_id", profileIds),
        ]);

        if (teachingResult.error) {
          throw teachingResult.error;
        }
        if (learningResult.error) {
          throw learningResult.error;
        }

        if (!isMounted) {
          return;
        }

        const skillsById = new Map(
          ((skillsResult.data ?? []) as SkillRow[]).map((skill) => [skill.id, skill]),
        );
        const teachingRows = (teachingResult.data ?? []) as TeachingRow[];
        const learningRows = (learningResult.data ?? []) as LearningRow[];
        const currentMatchProfile = buildMatchProfile({
          learningRows,
          profile: currentProfile,
          skillsById,
          teachingRows,
        });
        const savedRows = (savedMatchesResult.data ?? []) as SavedMatchRow[];

        setSavedMatchKeys(
          new Set(savedRows.map((row) => getMatchPairKey(row.mentor_id, row.learner_id))),
        );
        setRecommendations(
          otherProfiles
            .map((profile) =>
              calculateCompatibility(
                currentMatchProfile,
                buildMatchProfile({ learningRows, profile, skillsById, teachingRows }),
              ),
            )
            .filter((match) => match.score > MINIMUM_VISIBLE_SCORE)
            .sort((left, right) => right.score - left.score),
        );
      } catch {
        if (isMounted) {
          setMessage({
            text: "We could not load matches right now. Please try again.",
            type: "error",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadMatches();

    return () => {
      isMounted = false;
    };
  }, []);

  async function saveMatch(match: MatchRecommendation) {
    const matchKey = getMatchPairKey(match.mentorId, match.learnerId);

    if (savedMatchKeys.has(matchKey)) {
      setMessage({ text: "This match has already been saved.", type: "error" });
      return;
    }

    setSavingMatchKey(matchKey);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.from("matches").insert({
      compatibility_score: match.score,
      learner_id: match.learnerId,
      mentor_id: match.mentorId,
      status: "pending",
    });

    setSavingMatchKey(null);

    if (error) {
      setMessage({ text: getMatchErrorMessage(error), type: "error" });
      return;
    }

    setSavedMatchKeys((current) => new Set(current).add(matchKey));
    setMessage({ text: "Match saved.", type: "success" });
  }

  const visibleRecommendations = useMemo(() => recommendations, [recommendations]);

  return (
    <section className="max-w-wide mx-auto grid w-full gap-6" aria-labelledby="matches-heading">
      <div>
        <h2 id="matches-heading" className="text-3xl font-bold tracking-tight">
          Your Matches
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Discover people who are the best fit for skill exchange.
        </p>
      </div>

      {message ? (
        <Alert variant={message.type === "error" ? "destructive" : "success"}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <MatchesLoadingState />
      ) : visibleRecommendations.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleRecommendations.map((match) => {
            const pairKey = getMatchPairKey(match.mentorId, match.learnerId);
            const isSaved = savedMatchKeys.has(pairKey);
            const isSaving = savingMatchKey === pairKey;

            return (
              <MatchCard
                key={match.candidate.id}
                isSaved={isSaved}
                isSaving={isSaving}
                match={match}
                onSave={() => void saveMatch(match)}
              />
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="font-medium">No suitable matches found yet.</p>
            <p className="text-muted-foreground mt-2 text-sm">
              Add more skills to improve recommendations.
            </p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}

function SkillBadges({ emptyLabel, skills }: { emptyLabel: string; skills: MatchSkill[] }) {
  if (skills.length === 0) {
    return <p className="text-muted-foreground text-sm">{emptyLabel}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <Badge key={skill.id} variant="outline">
          {skill.name}
        </Badge>
      ))}
    </div>
  );
}

function MatchCard({
  isSaved,
  isSaving,
  match,
  onSave,
}: {
  isSaved: boolean;
  isSaving: boolean;
  match: MatchRecommendation;
  onSave: () => void;
}) {
  const label = getCompatibilityLabel(match.score);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <Avatar className="size-14">
              {match.candidate.avatarUrl ? (
                <AvatarImage alt="" src={match.candidate.avatarUrl} />
              ) : null}
              <AvatarFallback>{formatInitials(match.candidate.fullName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <CardTitle className="truncate text-lg">{match.candidate.fullName}</CardTitle>
              <CardDescription>@{match.candidate.username}</CardDescription>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-2xl font-bold">{match.score}</p>
            <Badge variant={getScoreVariant(match.score)}>{label}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid flex-1 gap-4">
        <div className="grid gap-2">
          <h3 className="text-sm font-semibold">Matching Skills</h3>
          <SkillBadges emptyLabel="No matching skills listed." skills={match.matchingSkills} />
        </div>
        <div className="grid gap-2">
          <h3 className="text-sm font-semibold">Teaching Skills</h3>
          <SkillBadges
            emptyLabel="No teaching skills listed."
            skills={match.candidate.teachingSkills}
          />
        </div>
        <div className="grid gap-2">
          <h3 className="text-sm font-semibold">Learning Skills</h3>
          <SkillBadges
            emptyLabel="No learning skills listed."
            skills={match.candidate.learningSkills}
          />
        </div>
        <div className="grid gap-2">
          <h3 className="text-sm font-semibold">Why this match?</h3>
          <ul className="text-muted-foreground grid gap-1 text-sm leading-6">
            {match.explanations.map((explanation) => (
              <li key={explanation}>• {explanation}</li>
            ))}
          </ul>
        </div>
        <div className="mt-auto grid gap-2 sm:grid-cols-2">
          <Button className="w-full" disabled={isSaved || isSaving} onClick={onSave}>
            <Save aria-hidden="true" className="size-4" />
            {isSaved ? "Saved" : isSaving ? "Saving..." : "Save Match"}
          </Button>
          <SendRequestDialog
            buttonClassName="w-full"
            receiverId={match.candidate.id}
            receiverName={match.candidate.fullName}
            skills={match.candidate.teachingSkills}
          />
        </div>
      </CardContent>
    </Card>
  );
}
