import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <section className="max-w-wide mx-auto grid w-full gap-6" aria-labelledby="dashboard-heading">
      <div>
        <Badge variant="outline">Dashboard shell</Badge>
        <h1 id="dashboard-heading" className="mt-3 text-3xl font-bold tracking-tight">
          Learning dashboard foundation
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Sidebar, top navigation, responsive content regions, and future navigation slots are
          ready.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Future modules</CardTitle>
          <CardDescription>
            Profiles, AI matching, messages, sessions, reviews, community, and premium plan surfaces
            can be added here without changing the layout architecture.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <span>Profile completeness</span>
          <span>Recommended matches</span>
          <span>Upcoming sessions</span>
          <span>Messages</span>
          <span>Reviews</span>
          <span>Community activity</span>
        </CardContent>
      </Card>
    </section>
  );
}
