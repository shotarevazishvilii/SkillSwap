import { AuthCard } from "@/features/auth/components/auth-card";
import { SignInForm } from "@/features/auth/components/sign-in-form";

export default function SignInPage() {
  return (
    <AuthCard description="Welcome back. Sign in to continue skill swapping." title="Sign in">
      <SignInForm />
    </AuthCard>
  );
}
