"use client";

import { useState } from "react";
import type * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Link } from "@/lib/hooks/use-links";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipPopup,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface SortableDashboardIconLinkProps {
  link: Link;
  onEdit: (link: Link) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
  isToggling?: boolean;
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
  if (lowerUrl.includes("youtube")) {
    return { bg: "rgb(255, 0, 0)", border: "rgb(255, 0, 0)" };
  }
  if (lowerUrl.includes("instagram")) {
    return { bg: "rgb(225, 48, 108)", border: "rgb(225, 48, 108)" };
  }
  if (lowerUrl.includes("tiktok")) {
    return { bg: "rgb(0, 0, 0)", border: "rgb(0, 0, 0)" };
  }
  if (lowerUrl.includes("twitch")) {
    return { bg: "rgb(145, 70, 255)", border: "rgb(145, 70, 255)" };
  }
  if (lowerUrl.includes("whatsapp")) {
    return { bg: "rgb(37, 211, 102)", border: "rgb(37, 211, 102)" };
  }
  if (lowerUrl.includes("facebook")) {
    return { bg: "rgb(24, 119, 242)", border: "rgb(24, 119, 242)" };
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
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fillRule="evenodd" />
    );
  }
  if (lowerUrl.includes("medium")) {
    return (
      <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12" />
    );
  }
  if (lowerUrl.includes("youtube")) {
    return (
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    );
  }
  if (lowerUrl.includes("tiktok")) {
    return (
      <path d="M19.59 6.69a4.83 4.83 0 0 1-1.4-3.51V2.5h-3.26v13.67a2.84 2.84 0 0 1-5.64 0 2.84 2.84 0 0 1 5.64 0V9.67a6.27 6.27 0 0 0 4.66 2.08v-3.4a4.85 4.85 0 0 1-.4-.66z" />
    );
  }
  if (lowerUrl.includes("twitch")) {
    return (
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
    );
  }
  if (lowerUrl.includes("whatsapp")) {
    return (
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    );
  }
  if (lowerUrl.includes("facebook")) {
    return (
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
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
  if (lowerUrl.includes("youtube")) return "YouTube";
  if (lowerUrl.includes("instagram")) return "Instagram";
  if (lowerUrl.includes("tiktok")) return "TikTok";
  if (lowerUrl.includes("twitch")) return "Twitch";
  if (lowerUrl.includes("whatsapp")) return "WhatsApp";
  if (lowerUrl.includes("facebook")) return "Facebook";
  return "Link";
}

export function SortableDashboardIconLink({
  link,
  onEdit,
  onDelete,
  isDeleting = false,
  isToggling = false,
}: SortableDashboardIconLinkProps) {
  const [isHovered, setIsHovered] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const colors = getSocialIconColor(link.url);
  const svgPath = getSocialIconSvg(link.url);
  const linkTitle = getSocialIconTitle(link.url);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(link);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(link.id);
  };

  const tooltipText = link.title || linkTitle;

  const iconElement = (
    <div
      {...attributes}
      {...listeners}
      aria-label={tooltipText}
      className="inline-flex items-center justify-center text-white rounded-xl transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-100 focus:ring-zinc-400 cursor-grab active:cursor-grabbing"
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        width: "44px",
        height: "44px",
      }}
    >
      {svgPath ? (
        <svg
          role="img"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="currentColor"
          className="shrink-0 pointer-events-none"
        >
          <title>{linkTitle}</title>
          {svgPath}
        </svg>
      ) : (
        <span className="text-lg leading-none pointer-events-none">{link.icon}</span>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <div
        ref={setNodeRef}
        style={style}
        className={`relative group shrink-0 ${isDeleting || isToggling ? "opacity-60" : ""} ${isDragging ? "z-50" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Tooltip>
          <TooltipTrigger render={iconElement as React.ReactElement} />
          <TooltipPopup>{tooltipText}</TooltipPopup>
        </Tooltip>
        {isHovered && (
          <div className="absolute -top-3 -right-3 flex gap-1 z-10 transition-opacity duration-200">
             <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-6 w-6 p-0 rounded-full shadow-md bg-white border border-zinc-200 hover:bg-zinc-100"
                    onClick={handleEditClick}
                    aria-label={`Edit ${tooltipText}`}
                  >
                    <Pencil className="h-3 w-3 text-zinc-600" />
                  </Button> as React.ReactElement
                }
              />
              <TooltipPopup>Edit</TooltipPopup>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="h-6 w-6 p-0 rounded-full shadow-md border border-red-200"
                    onClick={handleDeleteClick}
                    aria-label={`Delete ${tooltipText}`}
                  >
                    <Trash2 className="h-3 w-3 text-white" />
                  </Button> as React.ReactElement
                }
              />
              <TooltipPopup>Delete</TooltipPopup>
            </Tooltip>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
