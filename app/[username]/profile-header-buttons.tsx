"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Share2 } from "lucide-react";
import { ShareDialog } from "@/components/share-dialog";

interface ProfileHeaderButtonsProps {
  name: string;
  username: string | null;
  avatarUrl: string | null;
}

export function ProfileHeaderButtons({
  name,
  username,
  avatarUrl,
}: ProfileHeaderButtonsProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full hover:opacity-80 transition-opacity"
          aria-label="Go to OneURL homepage"
        >
          <Image
            src="/logo.png"
            alt="OneURL"
            width={40}
            height={40}
            className="h-10 w-10"
            priority
          />
        </Link>
        <button
          onClick={() => setShareDialogOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:opacity-80 transition-opacity"
          aria-label="Share profile"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </div>

      {username && (
        <ShareDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          name={name}
          username={username}
          avatarUrl={avatarUrl}
        />
      )}
    </>
  );
}

