import { MapPin } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { MarketplaceSkill, MarketplaceUser } from "@/features/marketplace/types";
import { SendRequestDialog } from "@/features/requests/components/send-request-dialog";
import { formatInitials } from "@/lib/utils";

function SkillBadges({ emptyLabel, skills }: { emptyLabel: string; skills: MarketplaceSkill[] }) {
  if (skills.length === 0) {
    return <p className="text-muted-foreground text-sm">{emptyLabel}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <Badge key={`${skill.skillId}-${skill.level}`} variant="outline">
          {skill.name}
        </Badge>
      ))}
    </div>
  );
}

export function MarketplaceUserCard({ user }: { user: MarketplaceUser }) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="size-14">
            {user.avatarUrl ? <AvatarImage alt="" src={user.avatarUrl} /> : null}
            <AvatarFallback>{formatInitials(user.fullName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <CardTitle className="truncate text-lg">{user.fullName}</CardTitle>
            <p className="text-muted-foreground text-sm">@{user.username}</p>
            {user.location ? (
              <p className="text-muted-foreground mt-2 flex items-center gap-1 text-sm">
                <MapPin aria-hidden="true" className="size-3.5" />
                {user.location}
              </p>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid flex-1 gap-4">
        <p className="text-muted-foreground line-clamp-3 text-sm leading-6">
          {user.bio || "This member has not added a bio yet."}
        </p>
        <div className="grid gap-2">
          <h3 className="text-sm font-semibold">Skills I Can Teach</h3>
          <SkillBadges emptyLabel="No teaching skills listed." skills={user.teachingSkills} />
        </div>
        <div className="grid gap-2">
          <h3 className="text-sm font-semibold">Skills I Want to Learn</h3>
          <SkillBadges emptyLabel="No learning skills listed." skills={user.learningSkills} />
        </div>
      </CardContent>
      <CardFooter className="grid gap-2 sm:grid-cols-2">
        <Button asChild className="w-full" variant="outline">
          <Link href={`/dashboard/marketplace/${user.id}`}>View Profile</Link>
        </Button>
        <SendRequestDialog
          buttonClassName="w-full"
          receiverId={user.id}
          receiverName={user.fullName}
          skills={user.teachingSkills.map((skill) => ({ id: skill.skillId, name: skill.name }))}
        />
      </CardFooter>
    </Card>
  );
}
