"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
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
import { signUpSchema, type SignUpInput } from "@/lib/validations/auth";

export function SignUpForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [showSignInLink, setShowSignInLink] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<SignUpInput>({
    defaultValues: {
      confirmPassword: "",
      email: "",
      fullName: "",
      password: "",
    },
    resolver: zodResolver(signUpSchema),
  });

  async function onSubmit(values: SignUpInput) {
    setFormError(null);
    setShowSignInLink(false);
    setSuccessMessage(null);

    const supabase = createClient();
    const emailRedirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      options: {
        data: {
          full_name: values.fullName,
        },
        emailRedirectTo,
      },
      password: values.password,
    });

    if (error) {
      const message = getAuthErrorMessage(error);
      setFormError(message);
      setShowSignInLink(message.includes("already registered"));
      return;
    }

    const identities = data.user?.identities ?? [];
    if (data.user && identities.length === 0) {
      setFormError("This email is already registered. Please sign in instead.");
      setShowSignInLink(true);
      return;
    }

    if (data.session) {
      router.replace("/dashboard");
      router.refresh();
      return;
    }

    setSuccessMessage(
      "Account created. Check your email to confirm your account before signing in.",
    );
    form.reset({
      confirmPassword: "",
      email: values.email,
      fullName: values.fullName,
      password: "",
    });
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form className="grid gap-4" noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <AuthMessage message={successMessage} type="success" />
        <AuthMessage message={formError} type="error" />
        {showSignInLink ? (
          <Button asChild type="button" variant="outline">
            <Link href="/auth/sign-in">Sign in instead</Link>
          </Button>
        ) : null}
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input
                  autoComplete="name"
                  disabled={isSubmitting}
                  placeholder="Alex Morgan"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
              <FormLabel>Password</FormLabel>
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
                  placeholder="Repeat your password"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
        <p className="text-muted-foreground text-center text-sm">
          Already have an account?{" "}
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
