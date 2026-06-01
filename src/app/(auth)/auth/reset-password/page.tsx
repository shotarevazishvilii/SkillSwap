import { AuthCard } from "@/features/auth/components/auth-card";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <AuthCard
      description="Choose a new password for your SkillSwap account."
      title="Set a new password"
    >
      <ResetPasswordForm />
    </AuthCard>
  );
}
