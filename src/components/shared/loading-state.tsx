import { SkillSwapLogo } from "@/components/branding/skillswap-logo";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="flex min-h-screen items-center justify-center px-4 py-16"
      id="main-content"
    >
      <section className="w-full max-w-md text-center">
        <SkillSwapLogo className="mb-8 justify-center" imageClassName="h-auto w-56" />
        <p className="sr-only">{label}</p>
        <div className="grid gap-3" role="presentation">
          <Skeleton className="mx-auto h-5 w-48" />
          <Skeleton className="mx-auto h-4 w-64" />
          <Skeleton className="mx-auto h-4 w-52" />
        </div>
      </section>
    </main>
  );
}
