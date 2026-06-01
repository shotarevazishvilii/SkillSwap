import { SkillSwapLogo } from "@/components/branding/skillswap-logo";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main
      className="bg-muted/40 flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8"
      id="main-content"
    >
      <section
        aria-labelledby="auth-layout-heading"
        className="bg-card shadow-panel grid w-full max-w-5xl overflow-hidden rounded-xl border lg:grid-cols-[0.9fr_1.1fr]"
      >
        <div className="bg-accent text-accent-foreground flex flex-col justify-between gap-10 p-8 lg:p-10">
          <SkillSwapLogo href="/" imageClassName="h-auto w-56" />
          <div>
            <h1 id="auth-layout-heading" className="text-3xl font-bold tracking-tight">
              Skill exchange starts here
            </h1>
            <p className="text-accent-foreground/80 mt-3 text-sm leading-6">
              Authentication pages will reuse this accessible, responsive branded shell.
            </p>
          </div>
        </div>
        <div className="p-6 sm:p-10">{children}</div>
      </section>
    </main>
  );
}
