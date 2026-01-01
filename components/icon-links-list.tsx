"use client";

import type { Link } from "@/lib/hooks/use-links";
import { IconLink } from "./icon-link";

interface IconLinksListProps {
  links: Link[];
  className?: string;
  onLinkClick?: (link: Link) => void;
  renderLink?: (link: Link, linkComponent: React.ReactNode) => React.ReactNode;
}

export function IconLinksList({ links, className = "", onLinkClick, renderLink }: IconLinksListProps) {
  if (links.length === 0) return null;

  return (
    <div className={`relative ${className}`}>
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
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-thin px-1 relative z-2 py-1 flex-nowrap">
        {links.map((link) => {
          const linkComponent = (
            <div key={link.id} className="shrink-0">
              <IconLink
                link={link}
                onClick={() => onLinkClick?.(link)}
              />
            </div>
          );

          return renderLink ? renderLink(link, linkComponent) : linkComponent;
        })}
      </div>
    </div>
  );
}

