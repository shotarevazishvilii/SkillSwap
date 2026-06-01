"use client";

import { BookOpen, Inbox, Sparkles, Target, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import type { Database, Tables } from "@/lib/supabase/types";
import { formatDate } from "@/lib/utils";

type MatchStatus = Database["public"]["Enums"]["match_status"];
type RequestStatus = Database["public"]["Enums"]["learning_request_status"];
type SessionStatus = Database["public"]["Enums"]["session_status"];

type ProfileRow = Pick<Tables<"profiles">, "full_name" | "id" | "username">;
type SkillRow = Pick<Tables<"skills">, "id" | "name">;
type MatchRow = Pick<
  Tables<"matches">,
  "compatibility_score" | "created_at" | "id" | "learner_id" | "mentor_id" | "status"
>;
type RequestRow = Pick<
  Tables<"learning_requests">,
  "created_at" | "id" | "message" | "receiver_id" | "sender_id" | "skill_id" | "status"
>;
type SessionRow = Pick<
  Tables<"sessions">,
  "id" | "learner_id" | "mentor_id" | "scheduled_end" | "scheduled_start" | "skill_id" | "status"
>;

type RecentMatch = {
  id: string;
  name: string;
  score: number;
  status: MatchStatus;
};

type RecentRequest = {
  id: string;
  senderName: string;
  skillName: string;
  status: RequestStatus;
};

type UpcomingSession = {
  id: string;
  scheduledEnd: string;
  scheduledStart: string;
  skillName: string;
  status: SessionStatus;
};

type DashboardData = {
  firstName: string;
  learningSkillCount: number;
  pendingRequestCount: number;
  recentMatches: RecentMatch[];
  recentRequests: RecentRequest[];
  savedMatchCount: number;
  teachingSkillCount: number;
  upcomingSessions: UpcomingSession[];
};

const defaultDashboardData: DashboardData = {
  firstName: "there",
  learningSkillCount: 0,
  pendingRequestCount: 0,
  recentMatches: [],
  recentRequests: [],
  savedMatchCount: 0,
  teachingSkillCount: 0,
  upcomingSessions: [],
};

function getFirstName(profile: ProfileRow | null, fallbackEmail?: string) {
  const displayName = profile?.full_name ?? profile?.username ?? fallbackEmail ?? "there";
  return displayName.trim().split(/\s+/)[0] ?? "there";
}

function getDisplayName(profile: ProfileRow | undefined) {
  return profile?.full_name ?? profile?.username ?? "SkillSwap member";
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getStatusVariant(
  status: MatchStatus | RequestStatus | SessionStatus,
): BadgeProps["variant"] {
  switch (status) {
    case "accepted":
    case "completed":
      return "success";
    case "pending":
    case "scheduled":
      return "warning";
    case "cancelled":
    case "rejected":
      return "destructive";
  }
}

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function DashboardLoadingState() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="grid gap-6">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    </div>
  );
}

export function LearningDashboard() {
  const [data, setData] = useState<DashboardData>(defaultDashboardData);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
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
            setErrorMessage("Please sign in to view your dashboard.");
            setIsLoading(false);
          }
          return;
        }

        const [
          profileResult,
          teachingResult,
          learningResult,
          matchesResult,
          requestsResult,
          sessionsResult,
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, full_name, username")
            .eq("id", user.id)
            .maybeSingle(),
          supabase.from("user_teaching_skills").select("id").eq("user_id", user.id),
          supabase.from("user_learning_skills").select("id").eq("user_id", user.id),
          supabase
            .from("matches")
            .select("id, mentor_id, learner_id, compatibility_score, status, created_at")
            .or(`mentor_id.eq.${user.id},learner_id.eq.${user.id}`)
            .order("compatibility_score", { ascending: false })
            .limit(5),
          supabase
            .from("learning_requests")
            .select("id, sender_id, receiver_id, skill_id, message, status, created_at")
            .eq("receiver_id", user.id)
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("sessions")
            .select("id, mentor_id, learner_id, skill_id, scheduled_start, scheduled_end, status")
            .or(`mentor_id.eq.${user.id},learner_id.eq.${user.id}`)
            .gte("scheduled_start", new Date().toISOString())
            .order("scheduled_start", { ascending: true })
            .limit(5),
        ]);

        const results = [
          profileResult,
          teachingResult,
          learningResult,
          matchesResult,
          requestsResult,
          sessionsResult,
        ];
        const failedResult = results.find((result) => result.error);
        if (failedResult?.error) {
          throw failedResult.error;
        }

        const profile = profileResult.data as ProfileRow | null;
        const matches = (matchesResult.data ?? []) as MatchRow[];
        const requests = (requestsResult.data ?? []) as RequestRow[];
        const sessions = (sessionsResult.data ?? []) as SessionRow[];
        const profileIds = Array.from(
          new Set([
            ...matches.flatMap((match) => [match.mentor_id, match.learner_id]),
            ...requests.map((request) => request.sender_id),
          ]),
        ).filter((id) => id !== user.id);
        const skillIds = Array.from(
          new Set([
            ...requests.map((request) => request.skill_id),
            ...sessions.map((session) => session.skill_id),
          ]),
        );

        const [profilesResult, skillsResult, pendingRequestsResult, savedMatchesCountResult] =
          await Promise.all([
            profileIds.length > 0
              ? supabase.from("profiles").select("id, full_name, username").in("id", profileIds)
              : Promise.resolve({ data: [], error: null }),
            skillIds.length > 0
              ? supabase.from("skills").select("id, name").in("id", skillIds)
              : Promise.resolve({ data: [], error: null }),
            supabase
              .from("learning_requests")
              .select("id")
              .eq("receiver_id", user.id)
              .eq("status", "pending"),
            supabase
              .from("matches")
              .select("id")
              .or(`mentor_id.eq.${user.id},learner_id.eq.${user.id}`),
          ]);

        if (profilesResult.error) {
          throw profilesResult.error;
        }
        if (skillsResult.error) {
          throw skillsResult.error;
        }
        if (pendingRequestsResult.error) {
          throw pendingRequestsResult.error;
        }
        if (savedMatchesCountResult.error) {
          throw savedMatchesCountResult.error;
        }

        if (!isMounted) {
          return;
        }

        const profilesById = new Map(
          ((profilesResult.data ?? []) as ProfileRow[]).map((item) => [item.id, item]),
        );
        const skillsById = new Map(
          ((skillsResult.data ?? []) as SkillRow[]).map((item) => [item.id, item]),
        );

        setData({
          firstName: getFirstName(profile, user.email),
          learningSkillCount: learningResult.data?.length ?? 0,
          pendingRequestCount: pendingRequestsResult.data?.length ?? 0,
          recentMatches: matches.map((match) => {
            const otherUserId = match.mentor_id === user.id ? match.learner_id : match.mentor_id;
            return {
              id: match.id,
              name: getDisplayName(profilesById.get(otherUserId)),
              score: match.compatibility_score,
              status: match.status,
            } satisfies RecentMatch;
          }),
          recentRequests: requests.map((request) => ({
            id: request.id,
            senderName: getDisplayName(profilesById.get(request.sender_id)),
            skillName: skillsById.get(request.skill_id)?.name ?? "Unknown skill",
            status: request.status,
          })),
          savedMatchCount: savedMatchesCountResult.data?.length ?? 0,
          teachingSkillCount: teachingResult.data?.length ?? 0,
          upcomingSessions: sessions.map((session) => ({
            id: session.id,
            scheduledEnd: session.scheduled_end,
            scheduledStart: session.scheduled_start,
            skillName: skillsById.get(session.skill_id)?.name ?? "Unknown skill",
            status: session.status,
          })),
        });
      } catch {
        if (isMounted) {
          setErrorMessage("We could not load your dashboard right now. Please try again.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="max-w-wide mx-auto grid w-full gap-6" aria-labelledby="dashboard-heading">
      <div>
        <h2 id="dashboard-heading" className="text-3xl font-bold tracking-tight">
          Welcome back, {data.firstName}
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Keep learning and sharing your skills.
        </p>
      </div>

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <DashboardLoadingState />
      ) : (
        <>
          <StatsGrid data={data} />
          <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <div className="grid gap-6">
              <UpcomingSessionsCard sessions={data.upcomingSessions} />
              <RecentRequestsCard requests={data.recentRequests} />
              <LearningProgressCard
                learningSkillCount={data.learningSkillCount}
                teachingSkillCount={data.teachingSkillCount}
              />
            </div>
            <div className="grid gap-6">
              <RecentMatchesCard matches={data.recentMatches} />
              <QuickActionsCard />
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function StatsGrid({ data }: { data: DashboardData }) {
  const stats = [
    { icon: BookOpen, label: "Teaching Skills", value: data.teachingSkillCount },
    { icon: Target, label: "Learning Goals", value: data.learningSkillCount },
    { icon: Sparkles, label: "Matches", value: data.savedMatchCount },
    { icon: Inbox, label: "Pending Requests", value: data.pendingRequestCount },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <Icon aria-hidden="true" className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function UpcomingSessionsCard({ sessions }: { sessions: UpcomingSession[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Sessions</CardTitle>
        <CardDescription>Your next scheduled SkillSwap sessions.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {sessions.length > 0 ? (
          sessions.map((session) => (
            <div
              key={session.id}
              className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{session.skillName}</p>
                <p className="text-muted-foreground text-sm">
                  {formatDate(session.scheduledStart)} · {formatTime(session.scheduledStart)} -{" "}
                  {formatTime(session.scheduledEnd)}
                </p>
              </div>
              <Badge variant={getStatusVariant(session.status)}>
                {formatStatus(session.status)}
              </Badge>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">No upcoming sessions.</p>
        )}
      </CardContent>
    </Card>
  );
}

function RecentMatchesCard({ matches }: { matches: RecentMatch[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Matches</CardTitle>
        <CardDescription>Your strongest saved SkillSwap matches.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {matches.length > 0 ? (
          matches.map((match) => (
            <div
              key={match.id}
              className="flex items-center justify-between gap-3 rounded-lg border p-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{match.name}</p>
                <p className="text-muted-foreground text-sm">Compatibility Score</p>
              </div>
              <Badge variant="secondary">{match.score}</Badge>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">No matches yet.</p>
        )}
        <Button asChild variant="outline">
          <Link href="/dashboard/matches">View All Matches</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function RecentRequestsCard({ requests }: { requests: RecentRequest[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Requests</CardTitle>
        <CardDescription>Recent incoming learning requests.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {requests.length > 0 ? (
          requests.map((request) => (
            <div
              key={request.id}
              className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{request.senderName}</p>
                <p className="text-muted-foreground text-sm">{request.skillName}</p>
              </div>
              <Badge variant={getStatusVariant(request.status)}>
                {formatStatus(request.status)}
              </Badge>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">No requests yet.</p>
        )}
        <Button asChild variant="outline">
          <Link href="/dashboard/requests">View All Requests</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function LearningProgressCard({
  learningSkillCount,
  teachingSkillCount,
}: {
  learningSkillCount: number;
  teachingSkillCount: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Progress</CardTitle>
        <CardDescription>A simple snapshot of your SkillSwap setup.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-sm font-medium">Skills Teaching</p>
          <p className="mt-2 text-3xl font-bold">{teachingSkillCount}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-muted-foreground text-sm font-medium">Skills Learning</p>
          <p className="mt-2 text-3xl font-bold">{learningSkillCount}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionsCard() {
  const actions = [
    { href: "/dashboard/matches", icon: Sparkles, label: "Find Matches" },
    { href: "/dashboard/marketplace", icon: Users, label: "Browse Marketplace" },
    { href: "/dashboard/skills", icon: BookOpen, label: "Manage Skills" },
    { href: "/dashboard/requests", icon: Inbox, label: "View Requests" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Jump into the next useful SkillSwap task.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button key={action.href} asChild variant="outline" className="justify-start">
              <Link href={action.href}>
                <Icon aria-hidden="true" className="size-4" />
                {action.label}
              </Link>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
