"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { AuthMessage } from "@/features/auth/components/auth-message";
import {
  getProfileErrorMessage,
  getProfileLoadErrorMessage,
} from "@/features/profile/lib/profile-errors";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types";
import { formatInitials } from "@/lib/utils";
import {
  learningSkillFormSchema,
  profileFormSchema,
  teachingSkillFormSchema,
  type LearningSkillFormInput,
  type ProfileFormInput,
  type TeachingSkillFormInput,
} from "@/lib/validations/profile";

type ProfileRow = Pick<
  Tables<"profiles">,
  "availability" | "avatar_url" | "bio" | "full_name" | "id" | "location" | "username"
>;
type SkillRow = Pick<Tables<"skills">, "id" | "name" | "slug">;
type TeachingSkillRow = Pick<
  Tables<"user_teaching_skills">,
  "experience_level" | "id" | "skill_id" | "user_id"
>;
type LearningSkillRow = Pick<
  Tables<"user_learning_skills">,
  "id" | "skill_id" | "target_level" | "user_id"
>;

type TeachingLevel = TeachingSkillFormInput["experienceLevel"];
type LearningLevel = LearningSkillFormInput["targetLevel"];

type SkillItem = {
  id: string;
  level: string;
  name: string;
  skillId: string;
};

const teachingLevels = ["beginner", "intermediate", "advanced", "expert"] satisfies TeachingLevel[];
const learningLevels = ["beginner", "intermediate", "advanced", "expert"] satisfies LearningLevel[];

function emptyToNull(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

function formatLevel(level: string) {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

function mapSkillItems<TSkill extends { id: string; skill_id: string }>(
  rows: TSkill[],
  skillsById: Map<string, SkillRow>,
  getLevel: (row: TSkill) => string,
) {
  return rows.map((row) => ({
    id: row.id,
    level: getLevel(row),
    name: skillsById.get(row.skill_id)?.name ?? "Unknown skill",
    skillId: row.skill_id,
  }));
}

function SkillSelect({ skills }: { skills: SkillRow[] }) {
  return (
    <>
      <option value="">Select a skill</option>
      {skills.map((skill) => (
        <option key={skill.id} value={skill.id}>
          {skill.name}
        </option>
      ))}
    </>
  );
}

function ProfileLoadingState() {
  return (
    <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
      <Card>
        <CardHeader>
          <Skeleton className="size-20 rounded-full" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-28" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
      <div className="grid gap-6">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export function ProfileManagement() {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [teachingSkills, setTeachingSkills] = useState<SkillItem[]>([]);
  const [learningSkills, setLearningSkills] = useState<SkillItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profileMissing, setProfileMissing] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);
  const [removingSkillId, setRemovingSkillId] = useState<string | null>(null);

  const profileForm = useForm<ProfileFormInput>({
    defaultValues: {
      availability: "",
      avatarUrl: "",
      bio: "",
      fullName: "",
      location: "",
      username: "",
    },
    resolver: zodResolver(profileFormSchema),
  });

  const teachingForm = useForm<TeachingSkillFormInput>({
    defaultValues: {
      experienceLevel: "beginner",
      skillId: "",
    },
    resolver: zodResolver(teachingSkillFormSchema),
  });

  const learningForm = useForm<LearningSkillFormInput>({
    defaultValues: {
      skillId: "",
      targetLevel: "beginner",
    },
    resolver: zodResolver(learningSkillFormSchema),
  });

  const skillsById = useMemo(() => new Map(skills.map((skill) => [skill.id, skill])), [skills]);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
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
            setMessage({ text: "Please sign in to manage your profile.", type: "error" });
            setIsLoading(false);
          }
          return;
        }

        const [profileResult, skillsResult, teachingResult, learningResult] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, full_name, username, avatar_url, bio, location, availability")
            .eq("id", user.id)
            .maybeSingle(),
          supabase.from("skills").select("id, name, slug").order("name"),
          supabase
            .from("user_teaching_skills")
            .select("id, user_id, skill_id, experience_level")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("user_learning_skills")
            .select("id, user_id, skill_id, target_level")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
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

        const profileData = profileResult.data as ProfileRow | null;
        const skillData = (skillsResult.data ?? []) as SkillRow[];
        const teachingData = (teachingResult.data ?? []) as TeachingSkillRow[];
        const learningData = (learningResult.data ?? []) as LearningSkillRow[];
        const skillMap = new Map(skillData.map((skill) => [skill.id, skill]));

        setUserId(user.id);
        setProfile(profileData);
        setProfileMissing(!profileData);
        setSkills(skillData);
        setTeachingSkills(mapSkillItems(teachingData, skillMap, (row) => row.experience_level));
        setLearningSkills(mapSkillItems(learningData, skillMap, (row) => row.target_level));

        if (profileData) {
          profileForm.reset({
            availability: profileData.availability ?? "",
            avatarUrl: profileData.avatar_url ?? "",
            bio: profileData.bio ?? "",
            fullName: profileData.full_name ?? "",
            location: profileData.location ?? "",
            username: profileData.username ?? "",
          });
        }
      } catch (error) {
        if (isMounted) {
          setMessage({ text: getProfileErrorMessage(error), type: "error" });
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
  }, [profileForm]);

  async function saveProfile(values: ProfileFormInput) {
    if (!userId || profileMissing) {
      setMessage({
        text: "Your profile is not ready yet. Please sign out and sign in again.",
        type: "error",
      });
      return;
    }

    setMessage(null);
    const supabase = createClient();
    const payload = {
      availability: emptyToNull(values.availability),
      avatar_url: emptyToNull(values.avatarUrl),
      bio: emptyToNull(values.bio),
      full_name: values.fullName.trim(),
      location: emptyToNull(values.location),
      username: values.username.trim(),
    };

    const { error } = await supabase.from("profiles").update(payload).eq("id", userId);

    if (error) {
      setMessage({ text: getProfileErrorMessage(error), type: "error" });
      return;
    }

    setProfile((current) => (current ? { ...current, ...payload } : current));
    setMessage({ text: "Profile updated successfully.", type: "success" });
  }

  async function addTeachingSkill(values: TeachingSkillFormInput) {
    if (!userId) {
      return;
    }

    if (teachingSkills.some((skill) => skill.skillId === values.skillId)) {
      setMessage({ text: "This teaching skill is already on your profile.", type: "error" });
      return;
    }

    setMessage(null);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("user_teaching_skills")
      .insert({
        experience_level: values.experienceLevel,
        skill_id: values.skillId,
        user_id: userId,
      })
      .select("id, user_id, skill_id, experience_level")
      .single();

    if (error) {
      setMessage({ text: getProfileErrorMessage(error), type: "error" });
      return;
    }

    const inserted = data as TeachingSkillRow;
    const skill = skillsById.get(inserted.skill_id);
    setTeachingSkills((current) => [
      {
        id: inserted.id,
        level: inserted.experience_level,
        name: skill?.name ?? "Unknown skill",
        skillId: inserted.skill_id,
      },
      ...current,
    ]);
    teachingForm.reset({ experienceLevel: "beginner", skillId: "" });
    setMessage({ text: "Teaching skill added.", type: "success" });
  }

  async function addLearningSkill(values: LearningSkillFormInput) {
    if (!userId) {
      return;
    }

    if (learningSkills.some((skill) => skill.skillId === values.skillId)) {
      setMessage({ text: "This learning skill is already on your profile.", type: "error" });
      return;
    }

    setMessage(null);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("user_learning_skills")
      .insert({
        skill_id: values.skillId,
        target_level: values.targetLevel,
        user_id: userId,
      })
      .select("id, user_id, skill_id, target_level")
      .single();

    if (error) {
      setMessage({ text: getProfileErrorMessage(error), type: "error" });
      return;
    }

    const inserted = data as LearningSkillRow;
    const skill = skillsById.get(inserted.skill_id);
    setLearningSkills((current) => [
      {
        id: inserted.id,
        level: inserted.target_level,
        name: skill?.name ?? "Unknown skill",
        skillId: inserted.skill_id,
      },
      ...current,
    ]);
    learningForm.reset({ skillId: "", targetLevel: "beginner" });
    setMessage({ text: "Learning skill added.", type: "success" });
  }

  async function removeTeachingSkill(skillId: string) {
    if (!userId) {
      return;
    }

    setRemovingSkillId(skillId);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("user_teaching_skills")
      .delete()
      .eq("id", skillId)
      .eq("user_id", userId);

    setRemovingSkillId(null);

    if (error) {
      setMessage({ text: getProfileErrorMessage(error), type: "error" });
      return;
    }

    setTeachingSkills((current) => current.filter((skill) => skill.id !== skillId));
    setMessage({ text: "Teaching skill removed.", type: "success" });
  }

  async function removeLearningSkill(skillId: string) {
    if (!userId) {
      return;
    }

    setRemovingSkillId(skillId);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("user_learning_skills")
      .delete()
      .eq("id", skillId)
      .eq("user_id", userId);

    setRemovingSkillId(null);

    if (error) {
      setMessage({ text: getProfileErrorMessage(error), type: "error" });
      return;
    }

    setLearningSkills((current) => current.filter((skill) => skill.id !== skillId));
    setMessage({ text: "Learning skill removed.", type: "success" });
  }

  if (isLoading) {
    return <ProfileLoadingState />;
  }

  const displayName = profile?.full_name || profile?.username || "SkillSwap member";
  const avatarUrl = profile?.avatar_url;

  return (
    <section className="max-w-wide mx-auto grid w-full gap-6" aria-labelledby="profile-heading">
      <div>
        <h2 id="profile-heading" className="text-3xl font-bold tracking-tight">
          Profile
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Manage your public profile and the skills you want to exchange.
        </p>
      </div>

      <AuthMessage message={message?.text ?? null} type={message?.type ?? "success"} />
      {profileMissing ? (
        <AuthMessage
          message="We could not find your profile. Sign out and sign back in to let SkillSwap finish setting up your account."
          type="error"
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
        <Card className="h-fit">
          <CardHeader className="items-center text-center">
            <Avatar className="size-24">
              {avatarUrl ? <AvatarImage alt="" src={avatarUrl} /> : null}
              <AvatarFallback className="text-lg">{formatInitials(displayName)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{displayName}</CardTitle>
              <CardDescription>
                {profile?.username ? `@${profile.username}` : "No username yet"}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm leading-6">
              {profile?.bio || "Add a short bio so learners and mentors can understand your goals."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update the details shown to potential SkillSwap partners.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form
                className="grid gap-4"
                noValidate
                onSubmit={profileForm.handleSubmit(saveProfile)}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={profileForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            disabled={profileForm.formState.isSubmitting || profileMissing}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input
                            disabled={profileForm.formState.isSubmitting || profileMissing}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={profileForm.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          disabled={profileForm.formState.isSubmitting || profileMissing}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={profileForm.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input
                            disabled={profileForm.formState.isSubmitting || profileMissing}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="availability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Availability</FormLabel>
                        <FormControl>
                          <Input
                            disabled={profileForm.formState.isSubmitting || profileMissing}
                            placeholder="Weeknights, weekends..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={profileForm.control}
                  name="avatarUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avatar URL</FormLabel>
                      <FormControl>
                        <Input
                          disabled={profileForm.formState.isSubmitting || profileMissing}
                          placeholder="https://example.com/avatar.png"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  className="w-full sm:w-fit"
                  disabled={profileForm.formState.isSubmitting || profileMissing}
                  type="submit"
                >
                  {profileForm.formState.isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Skills I Can Teach</CardTitle>
            <CardDescription>Add skills you can help others learn.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <Form {...teachingForm}>
              <form
                className="grid gap-3 sm:grid-cols-[1fr_12rem_auto]"
                onSubmit={teachingForm.handleSubmit(addTeachingSkill)}
              >
                <FormField
                  control={teachingForm.control}
                  name="skillId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill</FormLabel>
                      <FormControl>
                        <select
                          className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={teachingForm.formState.isSubmitting || skills.length === 0}
                          {...field}
                        >
                          <SkillSelect skills={skills} />
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={teachingForm.control}
                  name="experienceLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Level</FormLabel>
                      <FormControl>
                        <select
                          className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={teachingForm.formState.isSubmitting}
                          {...field}
                        >
                          {teachingLevels.map((level) => (
                            <option key={level} value={level}>
                              {formatLevel(level)}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  className="self-end"
                  disabled={teachingForm.formState.isSubmitting || skills.length === 0}
                  type="submit"
                >
                  {teachingForm.formState.isSubmitting ? "Adding..." : "Add"}
                </Button>
              </form>
            </Form>
            <SkillList
              items={teachingSkills}
              removingSkillId={removingSkillId}
              onRemove={removeTeachingSkill}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skills I Want to Learn</CardTitle>
            <CardDescription>Add skills you want a SkillSwap partner to teach you.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <Form {...learningForm}>
              <form
                className="grid gap-3 sm:grid-cols-[1fr_12rem_auto]"
                onSubmit={learningForm.handleSubmit(addLearningSkill)}
              >
                <FormField
                  control={learningForm.control}
                  name="skillId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill</FormLabel>
                      <FormControl>
                        <select
                          className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={learningForm.formState.isSubmitting || skills.length === 0}
                          {...field}
                        >
                          <SkillSelect skills={skills} />
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={learningForm.control}
                  name="targetLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Level</FormLabel>
                      <FormControl>
                        <select
                          className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={learningForm.formState.isSubmitting}
                          {...field}
                        >
                          {learningLevels.map((level) => (
                            <option key={level} value={level}>
                              {formatLevel(level)}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  className="self-end"
                  disabled={learningForm.formState.isSubmitting || skills.length === 0}
                  type="submit"
                >
                  {learningForm.formState.isSubmitting ? "Adding..." : "Add"}
                </Button>
              </form>
            </Form>
            <SkillList
              items={learningSkills}
              removingSkillId={removingSkillId}
              onRemove={removeLearningSkill}
            />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function SkillList({
  items,
  onRemove,
  removingSkillId,
}: {
  items: SkillItem[];
  onRemove: (id: string) => Promise<void>;
  removingSkillId: string | null;
}) {
  if (items.length === 0) {
    return <p className="text-muted-foreground text-sm">No skills added yet.</p>;
  }

  return (
    <div className="grid gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between gap-3 rounded-lg border p-3"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{item.name}</p>
            <Badge className="mt-1" variant="outline">
              {formatLevel(item.level)}
            </Badge>
          </div>
          <Button
            aria-label={`Remove ${item.name}`}
            disabled={removingSkillId === item.id}
            size="icon"
            type="button"
            variant="ghost"
            onClick={() => void onRemove(item.id)}
          >
            <Trash2 aria-hidden="true" className="size-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
