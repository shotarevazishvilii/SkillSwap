"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AuthMessage } from "@/features/auth/components/auth-message";
import { getAuthErrorMessage } from "@/features/auth/lib/auth-errors";
import { createClient } from "@/lib/supabase/client";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";

export function ResetPasswordForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<ResetPasswordInput>({
    defaultValues: {
      confirmPassword: "",
      password: "",
    },
    resolver: zodResolver(resetPasswordSchema),
  });

  async function onSubmit(values: ResetPasswordInput) {
    setFormError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: values.password });

    if (error) {
      setFormError(getAuthErrorMessage(error));
      return;
    }

    await supabase.auth.signOut();
    router.replace("/auth/sign-in?reset=success");
    router.refresh();
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form className="grid gap-4" noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <AuthMessage message={formError} type="error" />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <Input
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  placeholder="At least 8 characters"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <Input
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  placeholder="Repeat your new password"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Updating password..." : "Update password"}
        </Button>
      </form>
    </Form>
  );
}
