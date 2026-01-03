"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SignInButtonProps {
  provider?: "google";
  children: React.ReactNode;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  callbackURL?: string;
}

export function SignInButton({
  provider = "google",
  children,
  className,
  size,
  variant,
  callbackURL,
}: SignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
  };

  return (
    <Button
      onClick={handleSignIn}
      disabled={isLoading}
      className={className}
      size={size}
      variant={variant}
    >
      {children}
    </Button>
  );
}

