"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

interface SignInButtonProps {
  provider?: "google";
  children: React.ReactNode;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function SignInButton({
  provider = "google",
  children,
  className,
  size,
  variant,
}: SignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const origin = window.location.origin;
      await authClient.signIn.social({
        provider,
        callbackURL: origin,
        newUserCallbackURL: `${origin}/onboarding/username`,
        errorCallbackURL: `${origin}/login?error=auth`,
      });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
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

