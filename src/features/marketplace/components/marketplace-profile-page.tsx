"use client";

import { ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getMarketplaceErrorMessage } from "@/features/marketplace/lib/marketplace-errors";
import { buildMarketplaceUsers, formatLevel } from "@/features/marketplace/lib/marketplace-mappers";
import type {
  MarketplaceLearningSkillRow,
  MarketplaceProfileRow,
  MarketplaceSkill,
  MarketplaceSkillRow,
  MarketplaceTeachingSkillRow,
  MarketplaceUser,
} from "@/features/marketplace/types";
import { SendRequestDialog } from "@/features/requests/components/send-request-dialog";
import { createClient } from "@/lib/supabase/client";
import { formatInitials } from "@/lib/utils";

function SkillList({ emptyLabel, skills }: { emptyLabel: string; skills: MarketplaceSkill[] }) {
  if (skills.length === 0) {
    return <p className="text-muted-foreground text-sm">{emptyLabel}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <Badge key={`${skill.skillId}-${skill.level}`} variant="outline">
          {skill.name} · {formatLevel(skill.level)}
        </Badge>
      ))}
    </div>
  );
}

function ProfileLoadingState() {
  return (
    <div className="grid gap-6">
      <Skeleton className="h-64 w-full" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}

export function MarketplaceProfilePage() {
  const params = useParams<{ userId: string }>();
  const userId = params.userId;
  const [profile, setProfile] = useState<MarketplaceUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        if (!userId) {
          setErrorMessage("This profile link is invalid.");
          return;
        }

        const supabase = createClient();
        const [profileResult, skillsResult, teachingResult, learningResult] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, full_name, username, avatar_url, bio, location")
            .eq("id", userId)
            .maybeSingle(),
          supabase.from("skills").select("id, name, slug").order("name"),
          supabase
            .from("user_teaching_skills")
            .select("id, user_id, skill_id, experience_level")
            .eq("user_id", userId),
          supabase
            .from("user_learning_skills")
            .select("id, user_id, skill_id, target_level")
            .eq("user_id", userId),
        ]);

        if (profileResult.error) {
          throw profileResult.error;
        }
        if (skillsResult.error) {
          throw skillsResult.error;
        }
        if (teachingResult.error) {
          throw teachingResult.error;
        }
        if (learningResult.error) {
          throw learningResult.error;
        }

        if (!isMounted) {
          return;
        }

        if (!profileResult.data) {
          setErrorMessage("We could not find that profile.");
          setProfile(null);
          return;
        }

        const users = buildMarketplaceUsers({
          learningRows: (learningResult.data ?? []) as MarketplaceLearningSkillRow[],
          profiles: [profileResult.data as MarketplaceProfileRow],
          skills: (skillsResult.data ?? []) as MarketplaceSkillRow[],
          teachingRows: (teachingResult.data ?? []) as MarketplaceTeachingSkillRow[],
        });

        if (users.length === 0) {
          setErrorMessage("This profile is not available in the marketplace yet.");
          setProfile(null);
          return;
        }

        setProfile(users[0] ?? null);
      } catch {
        if (isMounted) {
          setErrorMessage(getMarketplaceErrorMessage());
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  return (
    <section
      className="max-w-wide mx-auto grid w-full gap-6"
      aria-labelledby="marketplace-profile-heading"
    >
      <div>
        <Button asChild size="sm" variant="ghost" className="mb-4 w-fit">
          <Link href="/dashboard/marketplace">
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to Marketplace
          </Link>
        </Button>
        <h2 id="marketplace-profile-heading" className="text-3xl font-bold tracking-tight">
          Marketplace Profile
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Read-only profile details for a potential SkillSwap partner.
        </p>
      </div>

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <ProfileLoadingState />
      ) : profile ? (
        <>
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <Avatar className="size-24">
                  {profile.avatarUrl ? <AvatarImage alt="" src={profile.avatarUrl} /> : null}
                  <AvatarFallback className="text-lg">
                    {formatInitials(profile.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-2xl">{profile.fullName}</CardTitle>
                  <CardDescription>@{profile.username}</CardDescription>
                  {profile.location ? (
                    <p className="text-muted-foreground mt-3 flex items-center gap-2 text-sm">
                      <MapPin aria-hidden="true" className="size-4" />
                      {profile.location}
                    </p>
                  ) : null}
                  <p className="text-muted-foreground mt-4 max-w-3xl text-sm leading-6">
                    {profile.bio || "This member has not added a bio yet."}
                  </p>
                  <SendRequestDialog
                    buttonClassName="mt-5 w-full sm:w-fit"
                    receiverId={profile.id}
                    receiverName={profile.fullName}
                    skills={profile.teachingSkills.map((skill) => ({
                      id: skill.skillId,
                      name: skill.name,
                    }))}
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Teaching Skills</CardTitle>
                <CardDescription>Skills this member can teach.</CardDescription>
              </CardHeader>
              <CardContent>
                <SkillList
                  emptyLabel="No teaching skills listed."
                  skills={profile.teachingSkills}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Learning Skills</CardTitle>
                <CardDescription>Skills this member wants to learn.</CardDescription>
              </CardHeader>
              <CardContent>
                <SkillList
                  emptyLabel="No learning skills listed."
                  skills={profile.learningSkills}
                />
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </section>
  );
}
