"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
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
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";

export function ForgotPasswordForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<ForgotPasswordInput>({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(values: ForgotPasswordInput) {
    setFormError(null);
    setSuccessMessage(null);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/auth/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, { redirectTo });

    if (error) {
      setFormError(getAuthErrorMessage(error));
      return;
    }

    setSuccessMessage("If an account exists for this email, a reset link has been sent.");
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
        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Sending reset link..." : "Send reset link"}
        </Button>
        <p className="text-muted-foreground text-center text-sm">
          Remembered your password?{" "}
          <Link
            className="text-primary font-medium underline-offset-4 hover:underline"
            href="/auth/sign-in"
          >
            Sign in
          </Link>
        </p>
      </form>
    </Form>
  );
}
