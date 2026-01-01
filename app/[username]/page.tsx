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
import LinkClickTracker from "./link-click-tracker";
import { getAvatarUrl } from "@/lib/utils";
import { getOgImageUrl } from "@/lib/utils/og-image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProfileHeaderButtons } from "./profile-header-buttons";
import { CalBookingButton } from "@/components/cal-booking-button";

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

function getSocialIconColor(url: string): { bg: string; border: string } {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes("github")) {
    return { bg: "rgb(24, 23, 23)", border: "rgb(24, 23, 23)" };
  }
  if (lowerUrl.includes("twitter") || lowerUrl.includes("x.com")) {
    return { bg: "rgb(0, 0, 0)", border: "rgb(0, 0, 0)" };
  }
  if (lowerUrl.includes("linkedin")) {
    return { bg: "rgb(0, 119, 181)", border: "rgb(0, 119, 181)" };
  }
  if (lowerUrl.includes("medium")) {
    return { bg: "rgb(18, 16, 14)", border: "rgb(18, 16, 14)" };
  }
  return { bg: "rgb(24, 23, 23)", border: "rgb(24, 23, 23)" };
}

function getSocialIconSvg(url: string) {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes("github")) {
    return (
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    );
  }
  if (lowerUrl.includes("twitter") || lowerUrl.includes("x.com")) {
    return (
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    );
  }
  if (lowerUrl.includes("linkedin")) {
    return (
      <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z" />
    );
  }
  if (lowerUrl.includes("medium")) {
    return (
      <path d="M4.21 0A4.201 4.201 0 0 0 0 4.21v15.58A4.201 4.201 0 0 0 4.21 24h15.58A4.201 4.201 0 0 0 24 19.79v-1.093c-.137.013-.278.02-.422.02-2.577 0-4.027-2.146-4.09-4.832a7.592 7.592 0 0 1 .022-.708c.093-1.186.475-2.241 1.105-3.022a3.885 3.885 0 0 1 1.395-1.1c.468-.237 1.127-.367 1.664-.367h.023c.101 0 .202.004.303.01V4.211A4.201 4.201 0 0 0 19.79 0Zm.198 5.583h4.165l3.588 8.435 3.59-8.435h3.864v.146l-.019.004c-.705.16-1.063.397-1.063 1.254h-.003l.003 10.274c.06.676.424.885 1.063 1.03l.02.004v.145h-4.923v-.145l.019-.005c.639-.144.994-.353 1.054-1.03V7.267l-4.745 11.15h-.261L6.15 7.569v9.445c0 .857.358 1.094 1.063 1.253l.02.004v.147H4.405v-.147l.019-.004c.705-.16 1.065-.397 1.065-1.253V6.987c0-.857-.358-1.094-1.064-1.254l-.018-.004zm19.25 3.668c-1.086.023-1.733 1.323-1.813 3.124H24V9.298a1.378 1.378 0 0 0-.342-.047Zm-1.862 3.632c-.1 1.756.86 3.239 2.204 3.634v-3.634z" />
    );
  }
  return null;
}

function getSocialIconTitle(url: string): string {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes("github")) return "GitHub";
  if (lowerUrl.includes("twitter") || lowerUrl.includes("x.com")) return "X";
  if (lowerUrl.includes("linkedin")) return "LinkedIn";
  if (lowerUrl.includes("medium")) return "Medium";
  return "Link";
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
            <div className="space-y-3">
              <div className="relative">
                <div
                  className="absolute -left-4 sm:-left-6 lg:-left-8 top-1/2 -translate-y-1/2 w-16 h-20 z-10 pointer-events-none transition-opacity duration-300 rounded-r-full opacity-0"
                  style={{
                    background:
                      "radial-gradient(ellipse 64px 80px at left center, hsl(0 0% 95%) 0%, hsla(0 0% 95% / 0.8) 40%, hsla(0 0% 95% / 0.4) 70%, transparent 100%)",
                  }}
                  aria-hidden="true"
                />
                <div
                  className="absolute -right-4 sm:-right-6 lg:-right-8 top-1/2 -translate-y-1/2 w-16 h-20 z-10 pointer-events-none transition-opacity duration-300 rounded-l-full opacity-0"
                  style={{
                    background:
                      "radial-gradient(ellipse 64px 80px at right center, hsl(0 0% 95%) 0%, hsla(0 0% 95% / 0.8) 40%, hsla(0 0% 95% / 0.4) 70%, transparent 100%)",
                  }}
                  aria-hidden="true"
                />
                <div className="flex items-center gap-5 md:gap-6 overflow-x-auto scrollbar-hide px-1 relative z-2 py-0.5 [scrollbar-width:none] [-ms-overflow-style:none]">
                  {iconLinks.map((link) => {
                    const colors = getSocialIconColor(link.url);
                    const svgPath = getSocialIconSvg(link.url);
                    const title = getSocialIconTitle(link.url);
                    return (
                      <div key={link.id} className="relative shrink-0">
                        <LinkClickTracker linkId={link.id}>
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={link.title || title}
                            className="text-xs p-2 rounded-xl inline-flex items-center justify-center text-white border-zinc-300 relative cursor-pointer"
                            style={{
                              background: colors.bg,
                              border: `1px solid ${colors.border}`,
                            }}
                          >
                            {svgPath ? (
                              <svg
                                role="img"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                              >
                                <title>{title}</title>
                                {svgPath}
                              </svg>
                            ) : (
                              <span className="text-base">{link.icon}</span>
                            )}
                          </a>
                        </LinkClickTracker>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>

        <hr className="h-px bg-transparent border-t-2 border-dashed border-zinc-200 my-4" />

        {regularLinks.length > 0 && (
          <div className="space-y-3 mt-4">
            <div>
              <h2 className="text-xs font-medium text-zinc-900 mb-1">My Links</h2>
            </div>
            <div className="grid gap-3 grid-cols-1">
              {regularLinks.map((link) => {
                const previewImage = getOgImageUrl(link.url);
                return (
                  <div key={link.id} className="relative group">
                    <LinkClickTracker linkId={link.id}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative rounded-xl border border-zinc-200 bg-white transition-all cursor-pointer hover:border-zinc-300 p-3 block"
                      >
                        <div className="flex gap-3">
                          {previewImage && (
                            <div className="w-1/3 shrink-0">
                              <div className="aspect-[4/3] bg-zinc-100 rounded-lg overflow-hidden">
                                <Image
                                  src={previewImage}
                                  alt={link.title}
                                  width={200}
                                  height={150}
                                  className="w-full h-full object-cover select-none"
                                  draggable={false}
                                  unoptimized
                                />
                              </div>
                            </div>
                          )}
                          <div className="flex-1 min-w-0 space-y-2">
                            <h4 className="text-xs font-medium text-zinc-900 truncate">
                              {link.title}
                            </h4>
                            <p className="text-xs text-zinc-500 truncate">{link.url}</p>
                          </div>
                        </div>
                      </a>
                    </LinkClickTracker>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {regularLinks.length === 0 && links.length === 0 && (
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

      <div className="fixed bottom-6 right-6 z-50">
        <Link href="/signup">
          <Button
            variant="secondary"
            className="rounded-full px-8 h-12 font-medium shadow-sm hover:shadow transition-all bg-secondary/50 hover:bg-secondary/80 border-transparent"
          >
            Join {username || "OneURL"} on OneURL
          </Button>
        </Link>
      </div>
      </div>
    </div>
  );
}
