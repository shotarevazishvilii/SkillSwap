"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MarketplaceUserCard } from "@/features/marketplace/components/marketplace-user-card";
import { getMarketplaceErrorMessage } from "@/features/marketplace/lib/marketplace-errors";
import { buildMarketplaceUsers } from "@/features/marketplace/lib/marketplace-mappers";
import type {
  MarketplaceLearningSkillRow,
  MarketplaceProfileRow,
  MarketplaceSkillRow,
  MarketplaceTeachingSkillRow,
  MarketplaceUser,
} from "@/features/marketplace/types";
import { createClient } from "@/lib/supabase/client";

function MarketplaceLoadingState() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-80 w-full" />
      ))}
    </div>
  );
}

function userMatchesSearch(user: MarketplaceUser, query: string) {
  if (!query) {
    return true;
  }

  const searchableText = [
    user.fullName,
    user.username,
    ...user.teachingSkills.map((skill) => skill.name),
    ...user.learningSkills.map((skill) => skill.name),
  ]
    .join(" ")
    .toLowerCase();

  return searchableText.includes(query);
}

export function MarketplacePage() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [skills, setSkills] = useState<MarketplaceSkillRow[]>([]);
  const [users, setUsers] = useState<MarketplaceUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadMarketplace() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const supabase = createClient();
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          if (isMounted) {
            setErrorMessage("Please sign in to view the marketplace.");
            setIsLoading(false);
          }
          return;
        }

        const [profilesResult, skillsResult] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, full_name, username, avatar_url, bio, location")
            .neq("id", user.id)
            .order("full_name"),
          supabase.from("skills").select("id, name, slug").order("name"),
        ]);

        if (profilesResult.error) {
          throw profilesResult.error;
        }
        if (skillsResult.error) {
          throw skillsResult.error;
        }

        const profiles = (profilesResult.data ?? []) as MarketplaceProfileRow[];
        const profileIds = profiles.map((profile) => profile.id);
        const skillRows = (skillsResult.data ?? []) as MarketplaceSkillRow[];

        if (profileIds.length === 0) {
          if (isMounted) {
            setCurrentUserId(user.id);
            setSkills(skillRows);
            setUsers([]);
          }
          return;
        }

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

        setCurrentUserId(user.id);
        setSkills(skillRows);
        setUsers(
          buildMarketplaceUsers({
            learningRows: (learningResult.data ?? []) as MarketplaceLearningSkillRow[],
            profiles,
            skills: skillRows,
            teachingRows: (teachingResult.data ?? []) as MarketplaceTeachingSkillRow[],
          }),
        );
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

    void loadMarketplace();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch = userMatchesSearch(user, query);
      const matchesSkill = selectedSkillId
        ? user.teachingSkills.some((skill) => skill.skillId === selectedSkillId)
        : true;

      return matchesSearch && matchesSkill;
    });
  }, [searchQuery, selectedSkillId, users]);

  return (
    <section className="max-w-wide mx-auto grid w-full gap-6" aria-labelledby="marketplace-heading">
      <div>
        <h2 id="marketplace-heading" className="text-3xl font-bold tracking-tight">
          Skill Exchange Marketplace
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Discover people who can teach skills and learn from others.
        </p>
      </div>

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Search and Filter</CardTitle>
          <CardDescription>
            Search by person or skill, or filter by a skill someone teaches.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-[1fr_18rem]">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
            />
            <Input
              className="pl-9"
              disabled={isLoading}
              placeholder="Search by name or skill"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <select
            aria-label="Filter by teaching skill"
            className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading || skills.length === 0}
            value={selectedSkillId}
            onChange={(event) => setSelectedSkillId(event.target.value)}
          >
            <option value="">All teaching skills</option>
            {skills.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {isLoading ? (
        <MarketplaceLoadingState />
      ) : filteredUsers.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <MarketplaceUserCard key={user.id} user={user} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="font-medium">No matching users found.</p>
            <p className="text-muted-foreground mt-2 text-sm">
              Try a different search term or skill filter.
            </p>
          </CardContent>
        </Card>
      )}
      <span className="sr-only">Current user excluded: {currentUserId ? "yes" : "unknown"}</span>
    </section>
  );
}
