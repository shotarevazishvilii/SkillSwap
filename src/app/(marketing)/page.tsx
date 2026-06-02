import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  MessageSquare,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import { SkillSwapLogo } from "@/components/branding/skillswap-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SkillSwap - Learn Through Skill Exchange",
  description:
    "Teach what you know, learn what you need, and connect with learners and mentors through SkillSwap.",
};

const howItWorksSteps = [
  {
    description: "Add skills you can teach and skills you want to learn.",
    title: "Create Your Profile",
    icon: UserRound,
  },
  {
    description: "SkillSwap recommends compatible learning partners.",
    title: "Get Matched",
    icon: Sparkles,
  },
  {
    description: "Schedule sessions and exchange knowledge.",
    title: "Start Learning",
    icon: CalendarCheck,
  },
] as const;

const features = [
  {
    description: "Find compatible learning partners with intelligent skill matching.",
    title: "Smart Matching",
    icon: Sparkles,
  },
  {
    description: "Learn without paying for expensive courses.",
    title: "Skill Exchange",
    icon: BookOpen,
  },
  {
    description: "Connect and coordinate with matches.",
    title: "Messaging",
    icon: MessageSquare,
  },
  {
    description: "Track your learning journey.",
    title: "Progress Tracking",
    icon: Target,
  },
] as const;

function LandingSection({
  children,
  className = "",
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) {
  return (
    <section className={`max-w-wide mx-auto w-full px-4 py-16 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </section>
  );
}

function SectionHeading({
  description,
  title,
}: Readonly<{
  description: string;
  title: string;
}>) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      <p className="text-muted-foreground mt-3 text-base leading-7">{description}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <LandingSection className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center text-center">
        <SkillSwapLogo
          priority
          className="mb-8 justify-center"
          imageClassName="h-auto w-64 sm:w-80"
        />
        <h1 className="text-foreground max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Learn New Skills by Teaching What You Already Know
        </h1>
        <p className="text-muted-foreground mt-5 max-w-2xl text-base leading-7 sm:text-lg">
          SkillSwap connects learners and mentors through skill exchange. Teach what you know, learn
          what you need, and grow together.
        </p>
        <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/auth/sign-up">
              Get Started
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            <Link href="/auth/sign-in">Sign In</Link>
          </Button>
        </div>
      </LandingSection>

      <LandingSection>
        <SectionHeading
          description="A simple path from what you know to what you want to learn."
          title="How It Works"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {howItWorksSteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <Card key={step.title} className="h-full">
                <CardHeader>
                  <div className="bg-accent text-accent-foreground flex size-11 items-center justify-center rounded-full">
                    <Icon aria-hidden="true" className="size-5" />
                  </div>
                  <CardTitle className="pt-2">
                    {index + 1}. {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-6">{step.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </LandingSection>

      <LandingSection>
        <SectionHeading
          description="Everything needed to connect, coordinate, and keep moving forward."
          title="Built for Skill Exchange"
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card key={feature.title} className="h-full">
                <CardHeader>
                  <Icon aria-hidden="true" className="text-primary size-6" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </LandingSection>

      <LandingSection className="pb-20">
        <div className="bg-card shadow-soft rounded-2xl border px-6 py-12 text-center sm:px-10">
          <h2 className="text-card-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Start Learning Today
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-base leading-7">
            Join the SkillSwap community and grow through knowledge sharing.
          </p>
          <Button asChild size="lg" className="mt-8 w-full sm:w-auto">
            <Link href="/auth/sign-up">Create Free Account</Link>
          </Button>
        </div>
      </LandingSection>
    </>
  );
}
