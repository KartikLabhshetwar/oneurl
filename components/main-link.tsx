"use client";

import Image from "next/image";
import type { Link } from "@/lib/hooks/use-links";

interface MainLinkProps {
  link: Link;
  onClick?: () => void;
  showDescription?: boolean;
  description?: string | null;
}

export function MainLink({ link, onClick, showDescription = false, description }: MainLinkProps) {
  const displayImageUrl = link.previewImageUrl;
  const displayDescription = link.previewDescription || description;

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className="relative rounded-xl border border-zinc-200 bg-white transition-all cursor-pointer hover:border-zinc-300 hover:shadow-sm hover:shadow-zinc-200/50 block p-3 group"
    >
      <div className="flex gap-3">
        {displayImageUrl && (
          <div className="w-1/3 shrink-0">
            <div className="aspect-[4/3] bg-zinc-100 rounded-lg overflow-hidden relative">
              <Image
                src={displayImageUrl}
                alt={link.title}
                fill
                className="object-cover select-none"
                draggable={false}
                unoptimized
                onError={(e) => {
                  console.error("Failed to load image:", displayImageUrl);
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
            </div>
          </div>
        )}
        <div className="flex-1 min-w-0 p-4 space-y-1">
          <h4 className="text-sm font-semibold text-zinc-900 truncate group-hover:text-zinc-700">
            {link.title}
          </h4>
          <p className="text-xs text-zinc-500 truncate">{link.url}</p>
          {displayDescription && (
            <p className="text-xs text-zinc-600 line-clamp-2 mt-1.5">
              {displayDescription}
            </p>
          )}
        </div>
      </div>
    </a>
  );
}

