import { AuthCard } from "@/features/auth/components/auth-card";
import { SignUpForm } from "@/features/auth/components/sign-up-form";

export default function SignUpPage() {
  return (
    <AuthCard
      description="Create your account to teach, learn, and match with peers."
      title="Create account"
    >
      <SignUpForm />
    </AuthCard>
  );
}
