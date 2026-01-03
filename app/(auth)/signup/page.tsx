import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignInButton } from "@/components/sign-in-button";
import { AuthSplitLayout } from "@/components/auth-split-layout";
import Link from "next/link";

export default async function SignUpPage() {
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
    <AuthSplitLayout
      heading="Get started"
      description="Create your account in seconds and start sharing your links with the world"
      promotionalTitle="One link to rule them all"
      promotionalDescription="Stop sending multiple links. Create a beautiful, customizable profile page that showcases everything you want to share all in one place."
      showBackButton={true}
      backHref="/"
    >
      <div className="space-y-6">
        <SignInButton 
          className="w-full bg-zinc-900 hover:bg-zinc-800 text-white border-zinc-900 shadow-sm hover:shadow-md transition-all duration-200 font-medium" 
          size="default" 
          variant="default"
          callbackURL="/signup"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign up with Google
        </SignInButton>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Quick & secure signup
            </span>
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-zinc-900 hover:text-zinc-800 hover:underline font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}

