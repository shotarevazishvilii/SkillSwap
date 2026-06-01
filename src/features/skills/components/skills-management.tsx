"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

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
import { AuthMessage } from "@/features/auth/components/auth-message";
import { getProfileErrorMessage } from "@/features/profile/lib/profile-errors";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types";
import {
  learningSkillFormSchema,
  teachingSkillFormSchema,
  type LearningSkillFormInput,
  type TeachingSkillFormInput,
} from "@/lib/validations/profile";

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

type UserSkill = {
  id: string;
  level: string;
  name: string;
  skillId: string;
};

const teachingLevels = ["beginner", "intermediate", "advanced", "expert"] satisfies TeachingLevel[];
const learningLevels = ["beginner", "intermediate", "advanced", "expert"] satisfies LearningLevel[];

function formatLevel(level: string) {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

function mapTeachingSkill(row: TeachingSkillRow, skillsById: Map<string, SkillRow>) {
  return {
    id: row.id,
    level: row.experience_level,
    name: skillsById.get(row.skill_id)?.name ?? "Unknown skill",
    skillId: row.skill_id,
  } satisfies UserSkill;
}

function mapLearningSkill(row: LearningSkillRow, skillsById: Map<string, SkillRow>) {
  return {
    id: row.id,
    level: row.target_level,
    name: skillsById.get(row.skill_id)?.name ?? "Unknown skill",
    skillId: row.skill_id,
  } satisfies UserSkill;
}

function SkillOptions({ skills }: { skills: SkillRow[] }) {
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

function SkillsLoadingState() {
  return (
    <div className="grid gap-6">
      <Skeleton className="h-28 w-full" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  );
}

export function SkillsManagement() {
  const [userId, setUserId] = useState<string | null>(null);
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [teachingSkills, setTeachingSkills] = useState<UserSkill[]>([]);
  const [learningSkills, setLearningSkills] = useState<UserSkill[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);
  const [removingSkillId, setRemovingSkillId] = useState<string | null>(null);

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
  const filteredSkills = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return skills;
    }

    return skills.filter((skill) => skill.name.toLowerCase().includes(query));
  }, [searchQuery, skills]);

  useEffect(() => {
    let isMounted = true;

    async function loadSkills() {
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
            setMessage({ text: "Please sign in to manage your skills.", type: "error" });
            setIsLoading(false);
          }
          return;
        }

        const [skillsResult, teachingResult, learningResult] = await Promise.all([
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

        const skillData = (skillsResult.data ?? []) as SkillRow[];
        const skillMap = new Map(skillData.map((skill) => [skill.id, skill]));
        const teachingData = (teachingResult.data ?? []) as TeachingSkillRow[];
        const learningData = (learningResult.data ?? []) as LearningSkillRow[];

        setUserId(user.id);
        setSkills(skillData);
        setTeachingSkills(teachingData.map((row) => mapTeachingSkill(row, skillMap)));
        setLearningSkills(learningData.map((row) => mapLearningSkill(row, skillMap)));
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

    void loadSkills();

    return () => {
      isMounted = false;
    };
  }, []);

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

    setTeachingSkills((current) => [
      mapTeachingSkill(data as TeachingSkillRow, skillsById),
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

    setLearningSkills((current) => [
      mapLearningSkill(data as LearningSkillRow, skillsById),
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

  return (
    <section className="max-w-wide mx-auto grid w-full gap-6" aria-labelledby="skills-heading">
      <div>
        <h2 id="skills-heading" className="text-3xl font-bold tracking-tight">
          Skills
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Manage the skills you teach and the skills you want to learn.
        </p>
      </div>

      <AuthMessage message={message?.text ?? null} type={message?.type ?? "success"} />

      {isLoading ? (
        <SkillsLoadingState />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Available Skills</CardTitle>
              <CardDescription>Browse and search the SkillSwap skill catalog.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
                />
                <Input
                  className="pl-9"
                  placeholder="Search skills by name"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              {filteredSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {filteredSkills.map((skill) => (
                    <Badge key={skill.id} variant="outline">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No skills match your search.</p>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <SkillManagerCard
              addButtonLabel="Add Teaching Skill"
              description="Add skills you can teach other SkillSwap members."
              formType="teaching"
              isSubmitting={teachingForm.formState.isSubmitting}
              items={teachingSkills}
              levels={teachingLevels}
              levelName="experienceLevel"
              levelTitle="Experience Level"
              removingSkillId={removingSkillId}
              skills={skills}
              title="Skills I Teach"
              onRemove={removeTeachingSkill}
            >
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
                            <SkillOptions skills={skills} />
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
                    {teachingForm.formState.isSubmitting ? "Adding..." : "Add Skill"}
                  </Button>
                </form>
              </Form>
            </SkillManagerCard>

            <SkillManagerCard
              addButtonLabel="Add Learning Skill"
              description="Add skills you want to learn from SkillSwap members."
              formType="learning"
              isSubmitting={learningForm.formState.isSubmitting}
              items={learningSkills}
              levels={learningLevels}
              levelName="targetLevel"
              levelTitle="Target Level"
              removingSkillId={removingSkillId}
              skills={skills}
              title="Skills I Want to Learn"
              onRemove={removeLearningSkill}
            >
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
                            <SkillOptions skills={skills} />
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
                    {learningForm.formState.isSubmitting ? "Adding..." : "Add Skill"}
                  </Button>
                </form>
              </Form>
            </SkillManagerCard>
          </div>
        </>
      )}
    </section>
  );
}

function SkillManagerCard({
  children,
  description,
  items,
  removingSkillId,
  title,
  onRemove,
}: Readonly<{
  addButtonLabel: string;
  children: React.ReactNode;
  description: string;
  formType: "learning" | "teaching";
  isSubmitting: boolean;
  items: UserSkill[];
  levels: readonly string[];
  levelName: string;
  levelTitle: string;
  removingSkillId: string | null;
  skills: SkillRow[];
  title: string;
  onRemove: (id: string) => Promise<void>;
}>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        {children}
        <SkillList items={items} removingSkillId={removingSkillId} onRemove={onRemove} />
      </CardContent>
    </Card>
  );
}

function SkillList({
  items,
  onRemove,
  removingSkillId,
}: {
  items: UserSkill[];
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
