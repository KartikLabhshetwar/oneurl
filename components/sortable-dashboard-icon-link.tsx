"use client";

import { useState } from "react";
import type * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Link } from "@/lib/hooks/use-links";
import { Pencil } from "lucide-react";
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
      <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z" />
    );
  }
  if (lowerUrl.includes("medium")) {
    return (
      <path d="M4.21 0A4.201 4.201 0 0 0 0 4.21v15.58A4.201 4.201 0 0 0 4.21 24h15.58A4.201 4.201 0 0 0 24 19.79v-1.093c-.137.013-.278.02-.422.02-2.577 0-4.027-2.146-4.09-4.832a7.592 7.592 0 0 1 .022-.708c.093-1.186.475-2.241 1.105-3.022a3.885 3.885 0 0 1 1.395-1.1c.468-.237 1.127-.367 1.664-.367h.023c.101 0 .202.004.303.01V4.211A4.201 4.201 0 0 0 19.79 0Zm.198 5.583h4.165l3.588 8.435 3.59-8.435h3.864v.146l-.019.004c-.705.16-1.063.397-1.063 1.254h-.003l.003 10.274c.06.676.424.885 1.063 1.03l.02.004v.145h-4.923v-.145l.019-.005c.639-.144.994-.353 1.054-1.03V7.267l-4.745 11.15h-.261L6.15 7.569v9.445c0 .857.358 1.094 1.063 1.253l.02.004v.147H4.405v-.147l.019-.004c.705-.16 1.065-.397 1.065-1.253V6.987c0-.857-.358-1.094-1.064-1.254l-.018-.004zm19.25 3.668c-1.086.023-1.733 1.323-1.813 3.124H24V9.298a1.378 1.378 0 0 0-.342-.047Zm-1.862 3.632c-.1 1.756.86 3.239 2.204 3.634v-3.634z" />
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
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 rounded-full shadow-sm z-10"
                  onClick={handleEditClick}
                  aria-label={`Edit ${tooltipText}`}
                >
                  <Pencil className="h-3 w-3" />
                </Button> as React.ReactElement
              }
            />
            <TooltipPopup>Edit {tooltipText}</TooltipPopup>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

