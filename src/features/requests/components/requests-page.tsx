"use client";

import { useEffect, useMemo, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLearningRequestErrorMessage } from "@/features/requests/lib/request-errors";
import { createClient } from "@/lib/supabase/client";
import type { Database, Tables } from "@/lib/supabase/types";
import { formatDate } from "@/lib/utils";

type RequestStatus = Database["public"]["Enums"]["learning_request_status"];
type RequestRow = Pick<
  Tables<"learning_requests">,
  "created_at" | "id" | "message" | "receiver_id" | "sender_id" | "skill_id" | "status"
>;
type ProfileRow = Pick<Tables<"profiles">, "full_name" | "id" | "username">;
type SkillRow = Pick<Tables<"skills">, "id" | "name">;

type RequestItem = RequestRow & {
  receiverName: string;
  senderName: string;
  skillName: string;
};

type RequestAction = "accepted" | "cancelled" | "rejected";

function getDisplayName(profile: ProfileRow | undefined) {
  if (!profile) {
    return "Unknown member";
  }

  return profile.full_name ?? profile.username ?? "SkillSwap member";
}

function getStatusVariant(status: RequestStatus): BadgeProps["variant"] {
  switch (status) {
    case "accepted":
      return "success";
    case "rejected":
    case "cancelled":
      return "destructive";
    case "pending":
      return "warning";
  }
}

function formatStatus(status: RequestStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function RequestsLoadingState() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-36 w-full" />
      ))}
    </div>
  );
}

export function RequestsPage() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [incomingRequests, setIncomingRequests] = useState<RequestItem[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<RequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

  async function loadRequests() {
    setIsLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMessage({ text: "Please sign in to manage learning requests.", type: "error" });
        setIsLoading(false);
        return;
      }

      const { data: requestData, error: requestError } = await supabase
        .from("learning_requests")
        .select("id, sender_id, receiver_id, skill_id, message, status, created_at")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (requestError) {
        throw requestError;
      }

      const requests = (requestData ?? []) as RequestRow[];
      const profileIds = Array.from(
        new Set(requests.flatMap((request) => [request.sender_id, request.receiver_id])),
      );
      const skillIds = Array.from(new Set(requests.map((request) => request.skill_id)));

      const [profilesResult, skillsResult] = await Promise.all([
        profileIds.length > 0
          ? supabase.from("profiles").select("id, full_name, username").in("id", profileIds)
          : Promise.resolve({ data: [], error: null }),
        skillIds.length > 0
          ? supabase.from("skills").select("id, name").in("id", skillIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (profilesResult.error) {
        throw profilesResult.error;
      }
      if (skillsResult.error) {
        throw skillsResult.error;
      }

      const profilesById = new Map(
        ((profilesResult.data ?? []) as ProfileRow[]).map((profile) => [profile.id, profile]),
      );
      const skillsById = new Map(
        ((skillsResult.data ?? []) as SkillRow[]).map((skill) => [skill.id, skill]),
      );
      const items = requests.map((request) => ({
        ...request,
        receiverName: getDisplayName(profilesById.get(request.receiver_id)),
        senderName: getDisplayName(profilesById.get(request.sender_id)),
        skillName: skillsById.get(request.skill_id)?.name ?? "Unknown skill",
      }));

      setCurrentUserId(user.id);
      setIncomingRequests(items.filter((request) => request.receiver_id === user.id));
      setOutgoingRequests(items.filter((request) => request.sender_id === user.id));
    } catch (error) {
      setMessage({ text: getLearningRequestErrorMessage(error), type: "error" });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadRequests();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  async function updateRequestStatus(request: RequestItem, status: RequestAction) {
    if (!currentUserId) {
      return;
    }

    setActiveRequestId(request.id);
    setMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("learning_requests")
        .update({ status })
        .eq("id", request.id)
        .eq(status === "cancelled" ? "sender_id" : "receiver_id", currentUserId)
        .eq("status", "pending");

      if (error) {
        throw error;
      }

      const updateItem = (item: RequestItem) =>
        item.id === request.id ? { ...item, status } : item;
      setIncomingRequests((current) => current.map(updateItem));
      setOutgoingRequests((current) => current.map(updateItem));
      setMessage({ text: `Request ${status}.`, type: "success" });
    } catch (error) {
      setMessage({ text: getLearningRequestErrorMessage(error), type: "error" });
    } finally {
      setActiveRequestId(null);
    }
  }

  const pendingIncomingCount = useMemo(
    () => incomingRequests.filter((request) => request.status === "pending").length,
    [incomingRequests],
  );
  const pendingOutgoingCount = useMemo(
    () => outgoingRequests.filter((request) => request.status === "pending").length,
    [outgoingRequests],
  );

  return (
    <section className="max-w-wide mx-auto grid w-full gap-6" aria-labelledby="requests-heading">
      <div>
        <h2 id="requests-heading" className="text-3xl font-bold tracking-tight">
          Learning Requests
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Manage incoming and outgoing learning requests.
        </p>
      </div>

      {message ? (
        <Alert variant={message.type === "error" ? "destructive" : "success"}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      ) : null}

      <Tabs defaultValue="incoming">
        <TabsList className="grid w-full grid-cols-2 sm:w-fit">
          <TabsTrigger value="incoming">Incoming Requests ({pendingIncomingCount})</TabsTrigger>
          <TabsTrigger value="outgoing">Outgoing Requests ({pendingOutgoingCount})</TabsTrigger>
        </TabsList>
        <TabsContent value="incoming" className="mt-6">
          {isLoading ? (
            <RequestsLoadingState />
          ) : (
            <RequestList
              actionType="incoming"
              activeRequestId={activeRequestId}
              emptyMessage="No incoming requests."
              requests={incomingRequests}
              onUpdateStatus={updateRequestStatus}
            />
          )}
        </TabsContent>
        <TabsContent value="outgoing" className="mt-6">
          {isLoading ? (
            <RequestsLoadingState />
          ) : (
            <RequestList
              actionType="outgoing"
              activeRequestId={activeRequestId}
              emptyMessage="No outgoing requests."
              requests={outgoingRequests}
              onUpdateStatus={updateRequestStatus}
            />
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}

function RequestList({
  actionType,
  activeRequestId,
  emptyMessage,
  requests,
  onUpdateStatus,
}: {
  actionType: "incoming" | "outgoing";
  activeRequestId: string | null;
  emptyMessage: string;
  requests: RequestItem[];
  onUpdateStatus: (request: RequestItem, status: RequestAction) => Promise<void>;
}) {
  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="font-medium">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {requests.map((request) => (
        <RequestCard
          key={request.id}
          actionType={actionType}
          isUpdating={activeRequestId === request.id}
          request={request}
          onUpdateStatus={onUpdateStatus}
        />
      ))}
    </div>
  );
}

function RequestCard({
  actionType,
  isUpdating,
  request,
  onUpdateStatus,
}: {
  actionType: "incoming" | "outgoing";
  isUpdating: boolean;
  request: RequestItem;
  onUpdateStatus: (request: RequestItem, status: RequestAction) => Promise<void>;
}) {
  const displayName = actionType === "incoming" ? request.senderName : request.receiverName;
  const label = actionType === "incoming" ? "From" : "To";

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-lg">
              {label}: {displayName}
            </CardTitle>
            <CardDescription>
              {request.skillName} · {formatDate(request.created_at)}
            </CardDescription>
          </div>
          <Badge variant={getStatusVariant(request.status)}>{formatStatus(request.status)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <p className="bg-muted/30 text-muted-foreground rounded-lg border p-3 text-sm">
          {request.message || "No message provided."}
        </p>
        {request.status === "pending" ? (
          actionType === "incoming" ? (
            <div className="grid gap-2 sm:flex sm:justify-end">
              <Button
                disabled={isUpdating}
                variant="outline"
                onClick={() => void onUpdateStatus(request, "rejected")}
              >
                {isUpdating ? "Updating..." : "Reject"}
              </Button>
              <Button
                disabled={isUpdating}
                onClick={() => void onUpdateStatus(request, "accepted")}
              >
                {isUpdating ? "Updating..." : "Accept"}
              </Button>
            </div>
          ) : (
            <div className="grid gap-2 sm:flex sm:justify-end">
              <Button
                disabled={isUpdating}
                variant="outline"
                onClick={() => void onUpdateStatus(request, "cancelled")}
              >
                {isUpdating ? "Cancelling..." : "Cancel"}
              </Button>
            </div>
          )
        ) : null}
      </CardContent>
    </Card>
  );
}
