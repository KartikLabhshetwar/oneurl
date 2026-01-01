"use client";

import { Link2, BadgeCheck } from "lucide-react";
import Image from "next/image";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import type { Link } from "@/lib/hooks/use-links";
import { CalBookingButton } from "@/components/cal-booking-button";
import { IconLinksList } from "@/components/icon-links-list";
import { MainLinksList } from "@/components/main-links-list";

interface ProfilePreviewNewProps {
  name: string;
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  title?: string | null;
  links: Link[];
  calLink?: string | null;
  className?: string;
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


export function ProfilePreview({
  name,
  username,
  bio,
  avatarUrl,
  title,
  links,
  calLink,
  className,
}: ProfilePreviewNewProps) {
  const activeLinks = links.filter((link) => link.isActive);
  const iconLinks = activeLinks.filter((link) => link.icon);
  const regularLinks = activeLinks.filter((link) => !link.icon);

  return (
    <div className={`bg-zinc-100 mx-auto w-full max-w-lg px-4 sm:px-6 lg:px-8 flex flex-col py-12 ${className || ""}`}>
      <main className="font-mono text-sm relative">
        <section className="relative">
          <div className="flex items-center gap-2 mb-4">
            {avatarUrl && (
              <div className="size-10 rounded-full overflow-hidden bg-gray-200">
                <Image
                  src={avatarUrl}
                  alt={name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover select-none"
                  draggable={false}
                />
              </div>
            )}
            <div className="relative rounded-md transition-all border border-transparent">
              <h1 className="text-sm font-medium flex items-center gap-0.5">
                <span>{name}</span>
                <BadgeCheck className="size-5 text-white [&>path:first-child]:fill-amber-500" />
              </h1>
              {username && (
                <div className="text-xs text-zinc-500 mt-0.5">
                  @{username}
                </div>
              )}
              {title && (
                <div className="flex items-center gap-1 text-xs">
                  <span>{title}</span>
                </div>
              )}
            </div>
          </div>

          {bio && (
            <div className="relative rounded-md transition-all mb-4 border border-transparent">
              <div className="wrap-break-word overflow-wrap-anywhere text-sm mx-auto leading-relaxed">
                <div className="mt-1 mb-1 wrap-break-word overflow-wrap-anywhere">
                  {parseBioWithCode(bio)}
                </div>
              </div>
            </div>
          )}

          {iconLinks.length > 0 && (
            <div className="mb-4">
              <IconLinksList links={iconLinks} />
            </div>
          )}
        </section>

        {regularLinks.length > 0 && (
          <>
            <hr className="h-px bg-transparent border-t-2 border-dashed border-zinc-200 my-4" />
            <MainLinksList links={regularLinks} className="mt-4" />
          </>
        )}

        {iconLinks.length > 0 && regularLinks.length === 0 && (
          <>
            <hr className="h-px bg-transparent border-t-2 border-dashed border-zinc-200 my-4" />
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
          </>
        )}

        {regularLinks.length === 0 && iconLinks.length === 0 && activeLinks.length === 0 && (
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

        {calLink && (
          <>
            <hr className="h-px bg-transparent border-t-2 border-dashed border-zinc-200 my-4" />

            <div className="space-y-3">
              <div>
                <h2 className="text-xs font-medium text-zinc-900 mb-1">Book a Meeting</h2>
                <p className="text-xs text-zinc-600">Schedule a time to chat with me!</p>
              </div>
              <CalBookingButton
                calLink={calLink}
                variant="default"
                size="sm"
                className="w-fit"
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

