"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { AuthMessage } from "@/features/auth/components/auth-message";
import { getLearningRequestErrorMessage } from "@/features/requests/lib/request-errors";
import type { RequestSkillOption } from "@/features/requests/types";
import { createClient } from "@/lib/supabase/client";
import {
  learningRequestFormSchema,
  type LearningRequestFormInput,
} from "@/lib/validations/requests";

export function SendRequestDialog({
  buttonClassName,
  receiverId,
  receiverName,
  skills,
}: {
  buttonClassName?: string;
  receiverId: string;
  receiverName: string;
  skills: RequestSkillOption[];
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

  const form = useForm<LearningRequestFormInput>({
    defaultValues: {
      message: "",
      skillId: "",
    },
    resolver: zodResolver(learningRequestFormSchema),
  });

  async function onSubmit(values: LearningRequestFormInput) {
    setMessage(null);

    if (skills.length === 0) {
      setMessage({
        text: "This user does not have teaching skills available for requests.",
        type: "error",
      });
      return;
    }

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMessage({ text: "Please sign in to send a learning request.", type: "error" });
        return;
      }

      if (user.id === receiverId) {
        setMessage({ text: "You cannot send a request to yourself.", type: "error" });
        return;
      }

      const { data: existingRequest, error: existingError } = await supabase
        .from("learning_requests")
        .select("id")
        .eq("sender_id", user.id)
        .eq("receiver_id", receiverId)
        .eq("skill_id", values.skillId)
        .eq("status", "pending")
        .maybeSingle();

      if (existingError) {
        throw existingError;
      }

      if (existingRequest) {
        setMessage({
          text: "You already have a pending request for this user and skill.",
          type: "error",
        });
        return;
      }

      const { error } = await supabase.from("learning_requests").insert({
        message: values.message?.trim() || null,
        receiver_id: receiverId,
        sender_id: user.id,
        skill_id: values.skillId,
        status: "pending",
      });

      if (error) {
        throw error;
      }

      setMessage({ text: "Learning request sent.", type: "success" });
      form.reset({ message: "", skillId: "" });
    } catch (error) {
      setMessage({ text: getLearningRequestErrorMessage(error), type: "error" });
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={buttonClassName} type="button" variant="default">
          <Send aria-hidden="true" className="size-4" />
          Send Request
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send learning request</DialogTitle>
          <DialogDescription>
            Ask {receiverName} to help you learn one of their teaching skills.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="grid gap-4" noValidate onSubmit={form.handleSubmit(onSubmit)}>
            <AuthMessage message={message?.text ?? null} type={message?.type ?? "success"} />
            <FormField
              control={form.control}
              name="skillId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skill</FormLabel>
                  <FormControl>
                    <select
                      className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isSubmitting || skills.length === 0}
                      {...field}
                    >
                      <option value="">Select a skill</option>
                      {skills.map((skill) => (
                        <option key={skill.id} value={skill.id}>
                          {skill.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isSubmitting}
                      placeholder="I'd like to learn this skill from you."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isSubmitting || skills.length === 0} type="submit">
              {isSubmitting ? "Sending..." : "Send Request"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
