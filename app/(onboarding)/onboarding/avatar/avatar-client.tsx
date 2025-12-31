"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UploadButton } from "@uploadthing/react";
import { Button } from "@/components/ui/button";
import type { OurFileRouter } from "@/lib/uploadthing";

interface AvatarClientProps {
  initialImageUrl: string | null;
}

export default function AvatarClient({ initialImageUrl }: AvatarClientProps) {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialImageUrl);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (initialImageUrl && !avatarUrl) {
      setAvatarUrl(initialImageUrl);
    }
  }, [initialImageUrl, avatarUrl]);

  const handleUploadComplete = async (res: { url: string }[]) => {
    if (res && res[0]?.url) {
      setAvatarUrl(res[0].url);
      setIsUploading(false);
    }
  };

  const handleSkip = () => {
    router.push("/onboarding/links");
  };

  const handleContinue = async () => {
    if (!avatarUrl) {
      router.push("/onboarding/links");
      return;
    }

    try {
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl }),
      });

      if (res.ok) {
        router.push("/onboarding/links");
      }
    } catch {
    }
  };

  return (
    <div className="container mx-auto flex max-w-md flex-col items-center justify-center px-4 py-16">
      <div className="w-full space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold">Upload your avatar</h2>
          <p className="text-muted-foreground">
            Add a profile picture to personalize your page
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-dashed border-muted-foreground/30">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <svg
                  className="h-12 w-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}
          </div>

          <UploadButton<OurFileRouter>
            endpoint="avatarUploader"
            onUploadBegin={() => setIsUploading(true)}
            onClientUploadComplete={handleUploadComplete}
            onUploadError={() => setIsUploading(false)}
            content={{
              button: ({ ready }) => (
                <Button type="button" disabled={!ready || isUploading}>
                  {isUploading ? "Uploading..." : "Choose File"}
                </Button>
              ),
            }}
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handleSkip}>
            Skip
          </Button>
          <Button className="flex-1" onClick={handleContinue}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}

