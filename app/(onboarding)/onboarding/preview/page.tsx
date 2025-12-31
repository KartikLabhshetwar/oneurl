import { requireAuth } from "@/lib/auth-guard";
import { profileService } from "@/lib/services/profile.service";
import Image from "next/image";
import PreviewClient from "./preview-client";
import { getAvatarUrl } from "@/lib/utils";

export default async function PreviewPage() {
  const session = await requireAuth();
  const profile = await profileService.getByUserId(session.user.id);

  if (!profile) {
    return (
      <div className="container mx-auto flex max-w-md items-center justify-center px-4 py-16">
        <p>Profile not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex max-w-4xl flex-col gap-8 px-4 py-16">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold">Preview your profile</h2>
        <p className="text-muted-foreground">
          This is how your profile will look to visitors
        </p>
      </div>

      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border bg-card p-8 shadow-lg">
          <div className="flex flex-col items-center space-y-4">
            {getAvatarUrl(profile) && (
              <Image
                src={getAvatarUrl(profile)!}
                alt="Avatar"
                width={96}
                height={96}
                className="h-24 w-24 rounded-full"
              />
            )}
            <div className="text-center">
              <h3 className="text-xl font-semibold">
                {profile.name || "Your Name"}
              </h3>
              {profile.username && (
                <p className="text-sm text-muted-foreground">
                  @{profile.username}
                </p>
              )}
              {profile.bio && (
                <p className="mt-2 text-sm">{profile.bio}</p>
              )}
            </div>
          </div>

          {profile.profile?.links && profile.profile.links.length > 0 && (
            <div className="mt-8 space-y-2">
              {profile.profile.links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border bg-background p-4 text-center transition-colors hover:bg-accent"
                >
                  {link.title}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <PreviewClient profile={profile} />
    </div>
  );
}

