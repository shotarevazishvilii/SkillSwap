import { ArrowRight } from "lucide-react";

import { SkillSwapLogo } from "@/components/branding/skillswap-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main id="main-content" className="bg-background min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <section className="max-w-content mx-auto flex min-h-[calc(100vh-5rem)] w-full flex-col items-center justify-center text-center">
        <SkillSwapLogo priority className="mb-8" imageClassName="h-auto w-64 sm:w-80" />
        <Badge variant="secondary" className="mb-4">
          Foundation ready
        </Badge>
        <h1 className="text-foreground text-4xl font-bold tracking-tight sm:text-6xl">SkillSwap</h1>
        <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-7 sm:text-lg">
          AI-powered peer-to-peer skill exchange. This temporary homepage confirms the SaaS
          architecture is ready for future MVP features.
        </p>
        <Card className="shadow-soft mt-8 w-full max-w-2xl text-left">
          <CardHeader>
            <CardTitle>Architecture foundation</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground grid gap-3 text-sm sm:grid-cols-2">
            <span>App Router layouts</span>
            <span>Supabase-ready infrastructure</span>
            <span>Validated environment layer</span>
            <span>Accessible design system</span>
          </CardContent>
        </Card>
        <Button asChild className="mt-8">
          <a href="/api/health" aria-label="Open the health check endpoint">
            Check deployment health
            <ArrowRight aria-hidden="true" className="ml-2 size-4" />
          </a>
        </Button>
      </section>
    </main>
  );
}
