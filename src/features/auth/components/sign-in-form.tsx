"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { signInSchema, type SignInInput } from "@/lib/validations/auth";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    searchParams.get("reset") === "success"
      ? "Your password was updated. Sign in with your new password."
      : null,
  );

  const form = useForm<SignInInput>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(signInSchema),
  });

  async function onSubmit(values: SignInInput) {
    setFormError(null);
    setSuccessMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(values);

    if (error) {
      setFormError(getAuthErrorMessage(error));
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form className="grid gap-4" noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <AuthMessage message={successMessage} type="success" />
        <AuthMessage message={formError} type="error" />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  autoComplete="email"
                  disabled={isSubmitting}
                  placeholder="you@example.com"
                  type="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-3">
                <FormLabel>Password</FormLabel>
                <Link
                  className="text-primary text-sm font-medium underline-offset-4 hover:underline"
                  href="/auth/forgot-password"
                >
                  Forgot password?
                </Link>
              </div>
              <FormControl>
                <Input
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  placeholder="Enter your password"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
        <p className="text-muted-foreground text-center text-sm">
          New to SkillSwap?{" "}
          <Link
            className="text-primary font-medium underline-offset-4 hover:underline"
            href="/auth/sign-up"
          >
            Create an account
          </Link>
        </p>
      </form>
    </Form>
  );
}
