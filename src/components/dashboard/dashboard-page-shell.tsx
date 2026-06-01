import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardPageShell({
  description,
  title,
}: Readonly<{
  description: string;
  title: string;
}>) {
  return (
    <section
      className="max-w-wide mx-auto grid w-full gap-6"
      aria-labelledby="dashboard-page-title"
    >
      <div>
        <h2 id="dashboard-page-title" className="text-3xl font-bold tracking-tight">
          {title}
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl">{description}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            This SkillSwap section is ready for the next MVP feature implementation.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
