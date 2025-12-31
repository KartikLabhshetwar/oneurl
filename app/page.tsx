import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session) {
    const { db } = await import("@/lib/db");
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.isOnboarded) {
      redirect("/dashboard");
    } else {
      redirect("/onboarding/username");
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="OneURL"
              width={128}
              height={128}
              className="h-20 w-20"
            />
          </Link>
          <Button variant="outline" render={<Link href="/login" />}>
            Sign In
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto flex flex-col items-center justify-center px-4 py-32">
          <div className="max-w-2xl text-center space-y-6">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo.png"
                alt="OneURL"
                width={128}
                height={128}
                className="h-32 w-32"
              />
            </div>
            <h1 className="text-5xl font-bold tracking-tight">
              One URL for all your links
            </h1>
            <p className="text-xl text-muted-foreground">
              Create a beautiful profile page to share all your important links
              in one place. Open source alternative to Linktree.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                render={<Link href="/signup" />}
              >
                Get Started with Google
              </Button>
              <Button
                size="lg"
                variant="outline"
                render={
                  <Link href="https://github.com/KartikLabhshetwar/oneurl" target="_blank" rel="noopener noreferrer" />
                }
              >
                View on GitHub
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
