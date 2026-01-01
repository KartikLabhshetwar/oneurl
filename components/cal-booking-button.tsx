"use client";

import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

type CalBookingButtonProps = {
  calLink: string | null | undefined;
  className?: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "destructive-outline";
  size?: "sm" | "md" | "lg";
};

export function CalBookingButton({
  calLink,
  className,
  variant = "default",
  size = "sm",
}: CalBookingButtonProps) {
  if (!calLink) {
    return null;
  }

  const normalizedLink = calLink.startsWith("http")
    ? calLink
    : `https://cal.com/${calLink}`;

  return (
    <Button
      render={(props) => (
        <a
          {...props}
          href={normalizedLink}
          target="_blank"
          rel="noopener noreferrer"
        />
      )}
      variant={variant}
      size={size}
      className={className}
    >
      <Calendar />
      Book on Cal.com
    </Button>
  );
}

