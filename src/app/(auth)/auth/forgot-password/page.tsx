import { AuthCard } from "@/features/auth/components/auth-card";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      description="Enter your email and we will send a secure password reset link."
      title="Reset your password"
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
