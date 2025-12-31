import { notFound } from "next/navigation";
import { profileService } from "@/lib/services/profile.service";
import type { Metadata } from "next";
import Image from "next/image";
import LinkClickTracker from "./link-click-tracker";
import { getAvatarUrl } from "@/lib/utils";

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const user = await profileService.getByUsername(username);

  if (!user || !user.profile?.isPublished) {
    return {
      title: "Profile Not Found",
    };
  }

  const avatarUrl = getAvatarUrl(user);
  return {
    title: `${user.name} | OneURL`,
    description: user.bio || `Visit ${user.name}'s profile on OneURL`,
    openGraph: {
      title: `${user.name} | OneURL`,
      description: user.bio || `Visit ${user.name}'s profile on OneURL`,
      images: avatarUrl ? [avatarUrl] : [],
    },
    twitter: {
      card: "summary",
      title: `${user.name} | OneURL`,
      description: user.bio || `Visit ${user.name}'s profile on OneURL`,
      images: avatarUrl ? [avatarUrl] : [],
    },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const user = await profileService.getByUsername(username);

  if (!user || !user.profile?.isPublished) {
    notFound();
  }

  const links = user.profile.links.filter((link) => link.isActive);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border bg-card p-8 shadow-lg">
          <div className="flex flex-col items-center space-y-4">
            {getAvatarUrl(user) && (
              <Image
                src={getAvatarUrl(user)!}
                alt={user.name}
                width={96}
                height={96}
                className="h-24 w-24 rounded-full border-2"
              />
            )}
            <div className="text-center">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              {user.username && (
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              )}
              {user.bio && (
                <p className="mt-3 text-sm leading-relaxed">{user.bio}</p>
              )}
            </div>
          </div>

          {links.length > 0 && (
            <div className="mt-8 space-y-3">
              {links.map((link) => (
                <LinkClickTracker
                  key={link.id}
                  linkId={link.id}
                  profileId={user.profile!.id}
                >
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg border bg-background p-4 text-center font-medium transition-all hover:bg-accent hover:shadow-md active:scale-[0.98]"
                  >
                    {link.title}
                  </a>
                </LinkClickTracker>
              ))}
            </div>
          )}

          {links.length === 0 && (
            <div className="mt-8 text-center text-sm text-muted-foreground">
              No links available yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
