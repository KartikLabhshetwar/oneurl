"use client";

import { useQuery } from "@tanstack/react-query";
import { ProfilePreview } from "@/components/profile-preview";
import type { Link } from "@/lib/hooks/use-links";

interface PreviewWrapperProps {
  initialName: string;
  initialUsername: string | null;
  initialBio: string | null;
  initialAvatarUrl: string | null;
  initialTitle: string | null;
  initialCalLink: string | null;
}

export function PreviewWrapper({
  initialName,
  initialUsername,
  initialBio,
  initialAvatarUrl,
  initialTitle,
  initialCalLink,
}: PreviewWrapperProps) {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
  const { data: linksData } = useQuery({
    queryKey: ["links"],
    queryFn: async () => {
      const res = await fetch(`${BACKEND_URL}/api/links`, { credentials: "include" });
      if (!res.ok) {
        throw new Error("Failed to fetch links");
      }
      const data = await res.json();
      return (data.links || []) as Link[];
    },
    refetchInterval: 2000,
    refetchIntervalInBackground: false,
  });

  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch(`${BACKEND_URL}/api/profile`, { credentials: "include" });
      if (!res.ok) {
        throw new Error("Failed to fetch profile");
      }
      return res.json();
    },
    refetchInterval: 2000,
    refetchIntervalInBackground: false,
  });

  const links = linksData || [];
  const name = profileData?.name || initialName;
  const username = profileData?.username ?? initialUsername;
  const bio = profileData?.bio ?? initialBio;
  const avatarUrl = profileData?.avatarUrl || initialAvatarUrl;
  const title = profileData?.profile?.title ?? initialTitle;
  const calLink = profileData?.profile?.calLink ?? initialCalLink;

  return (
    <ProfilePreview
      name={name}
      username={username}
      bio={bio}
      avatarUrl={avatarUrl}
      title={title}
      links={links}
      calLink={calLink}
    />
  );
}

