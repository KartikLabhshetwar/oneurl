import { getSessionWithOnboardingStatus } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LandingNav } from "@/components/landing/nav";
import { LandingHero } from "@/components/landing/hero";
import { LandingFeatures } from "@/components/landing/feature-grid";
import { LandingCTA } from "@/components/landing/cta";
import { LandingFooter } from "@/components/landing/footer";

export default async function HomePage() {
  const { session, isOnboarded } = await getSessionWithOnboardingStatus();

  if (session) {
    if (isOnboarded) {
      redirect("/dashboard");
    } else {
      redirect("/onboarding/username");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 selection:bg-primary selection:text-primary-foreground">
      <LandingNav />
      <main className="flex-1 font-mono text-sm">
        <LandingHero />
        <LandingFeatures />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  );
}
