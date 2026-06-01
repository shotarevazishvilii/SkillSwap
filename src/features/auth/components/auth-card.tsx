import { SkillSwapLogo } from "@/components/branding/skillswap-logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthCard({
  children,
  description,
  title,
}: Readonly<{
  children: React.ReactNode;
  description: string;
  title: string;
}>) {
  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0 pt-0 text-center sm:text-left">
        <SkillSwapLogo className="mb-6 justify-center sm:hidden" imageClassName="h-auto w-48" />
        <p className="text-primary text-sm font-semibold">SkillSwap</p>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="px-0">{children}</CardContent>
    </Card>
  );
}
