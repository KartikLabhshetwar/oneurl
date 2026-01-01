import { notFound } from "next/navigation";
import { Link2, BadgeCheck } from "lucide-react";
import { profileService } from "@/lib/services/profile.service";
import type { Metadata } from "next";
import Image from "next/image";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { getAvatarUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProfileHeaderButtons } from "./profile-header-buttons";
import { CalBookingButton } from "@/components/cal-booking-button";
import { TrackedIconLinksList } from "@/components/tracked-icon-links-list";
import { TrackedMainLinksList } from "@/components/tracked-main-links-list";

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
  const profileUrl = `https://oneurl.live/${username}`;
  const images = avatarUrl 
    ? [{ url: avatarUrl, width: 400, height: 400, alt: `${user.name}'s profile picture` }]
    : [{ url: "/og.png", width: 1200, height: 630, alt: "OneURL" }];

  return {
    title: `${user.name} | OneURL`,
    description: user.bio || `Visit ${user.name}'s profile on OneURL`,
    metadataBase: new URL("https://oneurl.live"),
    openGraph: {
      title: `${user.name} | OneURL`,
      description: user.bio || `Visit ${user.name}'s profile on OneURL`,
      url: profileUrl,
      siteName: "OneURL",
      images,
      locale: "en_US",
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${user.name} | OneURL`,
      description: user.bio || `Visit ${user.name}'s profile on OneURL`,
      images: images.map(img => img.url),
    },
    alternates: {
      canonical: profileUrl,
    },
  };
}

function parseBioWithCode(bio: string) {
  const parts: (string | React.ReactElement)[] = [];
  const regex = /`([^`]+)`/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(bio)) !== null) {
    if (match.index > lastIndex) {
      const text = bio.slice(lastIndex, match.index);
      const lines = text.split("\n");
      lines.forEach((line, idx) => {
        if (idx > 0) {
          parts.push(<br key={`br-${key++}`} />);
        }
        if (line) {
          parts.push(line);
        }
      });
    }
    parts.push(
      <code
        key={key++}
        className="border border-zinc-300 bg-white text-[#00BA7C] px-1.5 py-0.5 rounded-sm text-xs font-mono break-all"
      >
        {match[1]}
      </code>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < bio.length) {
    const text = bio.slice(lastIndex);
    const lines = text.split("\n");
    lines.forEach((line, idx) => {
      if (idx > 0) {
        parts.push(<br key={`br-${key++}`} />);
      }
      if (line) {
        parts.push(line);
      }
    });
  }

  return parts.length > 0 ? parts : [bio];
}


export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const user = await profileService.getByUsername(username);

  if (!user || !user.profile?.isPublished) {
    notFound();
  }

  const links = user.profile.links.filter((link) => link.isActive);
  const iconLinks = links.filter((link) => link.icon);
  const regularLinks = links.filter((link) => !link.icon);

  const avatarUrl = getAvatarUrl(user);

  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="mx-auto w-full max-w-lg px-4 sm:px-6 lg:px-8 flex flex-col min-h-screen py-20">
      <main className="font-mono text-sm relative">
        <ProfileHeaderButtons
          name={user.name}
          username={user.username}
          avatarUrl={avatarUrl}
        />
        <section className="relative">
          <div className="flex items-center gap-2 mb-4">
            {avatarUrl && (
              <div className="size-10 rounded-full overflow-hidden bg-gray-200">
                <Image
                  src={avatarUrl}
                  alt={user.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover select-none"
                  draggable={false}
                  priority
                />
              </div>
            )}
            <div className="relative rounded-md transition-all border border-transparent">
              <h1 className="text-sm font-medium flex items-center gap-0.5">
                <span>{user.name}</span>
                <BadgeCheck className="size-5 text-white [&>path:first-child]:fill-amber-500" />
              </h1>
              {user.username && (
                <div className="text-xs text-zinc-500 mt-0.5">
                  @{user.username}
                </div>
              )}
              {user.profile?.title && (
                <div className="flex items-center gap-1 text-xs">
                  <span>{user.profile.title}</span>
                </div>
              )}
            </div>
          </div>

          {user.bio && (
            <div className="relative rounded-md transition-all mb-4 border border-transparent">
              <div className="wrap-break-word overflow-wrap-anywhere text-sm mx-auto leading-relaxed">
                <div className="mt-1 mb-1 wrap-break-word overflow-wrap-anywhere">
                  {parseBioWithCode(user.bio)}
                </div>
              </div>
            </div>
          )}

          {iconLinks.length > 0 && (
            <div className="mb-4">
              <TrackedIconLinksList links={iconLinks} />
            </div>
          )}
        </section>

        {regularLinks.length > 0 && (
          <>
            <hr className="h-px bg-transparent border-t-2 border-dashed border-zinc-200 my-4" />
            <TrackedMainLinksList links={regularLinks} />
          </>
        )}

        {regularLinks.length === 0 && iconLinks.length === 0 && links.length === 0 && (
          <div className="py-8 flex-1 flex items-center justify-center">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Link2 className="h-10 w-10 text-muted-foreground/50" />
                </EmptyMedia>
                <EmptyTitle>No links yet</EmptyTitle>
                <EmptyDescription>Check back later for updates.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        )}

        <hr className="h-px bg-transparent border-t-2 border-dashed border-zinc-200 my-4" />

        {user.profile?.calLink && (
          <div className="space-y-3">
            <div>
              <h2 className="text-xs font-medium text-zinc-900 mb-1">Book a Meeting</h2>
              <p className="text-xs text-zinc-600">Schedule a time to chat with me!</p>
            </div>
            <CalBookingButton
              calLink={user.profile.calLink}
              variant="default"
              size="sm"
              className="w-fit"
            />
          </div>
        )}
      </main>

      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <Link href="/signup">
          <Button
            variant="secondary"
            className="rounded-full px-4 py-2 h-9 sm:px-8 sm:h-12 text-xs sm:text-sm font-medium shadow-sm hover:shadow transition-all bg-secondary/50 hover:bg-secondary/80 border-transparent"
          >
            Join {username || "OneURL"} on OneURL
          </Button>
        </Link>
      </div>
      </div>
    </div>
  );
}
