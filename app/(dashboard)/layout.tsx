import { requireAuth } from "@/lib/auth-guard";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { getAvatarUrl } from "@/lib/utils";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user?.isOnboarded) {
    redirect("/onboarding/username");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col border-r bg-muted/30">
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="text-lg font-semibold">OneURL</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/links"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            Links
          </Link>
          <Link
            href="/dashboard/analytics"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            Analytics
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            Settings
          </Link>
        </nav>
        <div className="mt-auto border-t p-4">
          <div className="flex items-center gap-3 px-3">
            {getAvatarUrl(user) && (
              <Image
                src={getAvatarUrl(user)!}
                alt={user.name}
                className="h-8 w-8 rounded-full"
                width={32}
                height={32}
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              {user.username && (
                <p className="text-xs text-muted-foreground truncate">
                  @{user.username}
                </p>
              )}
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}

