"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usernameSchema } from "@/lib/validations/schemas";
import { cn } from "@/lib/utils";

export function UsernameClaimForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const checkAvailability = useCallback(async (value: string) => {
    if (!value) {
      setIsAvailable(null);
      setError("");
      setIsChecking(false);
      return;
    }

    try {
      usernameSchema.parse(value);
    } catch (e) {
      setIsAvailable(false);
      // Don't show error immediately for typing
      setIsChecking(false);
      return;
    }

    setIsChecking(true);
    setError("");

    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
      const res = await fetch(`${BACKEND_URL}/api/profile/check-username`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: value }),
      });

      const data = await res.json();
      if (res.ok && data.available) {
        setIsAvailable(true);
        setError("");
      } else {
        setIsAvailable(false);
        setError(data.error || "Username is not available");
      }
    } catch {
      setError("Failed to check username");
      setIsAvailable(false);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (username) {
      debounceTimerRef.current = setTimeout(() => {
        checkAvailability(username);
      }, 500);
    } else {
      setIsAvailable(null);
      setError("");
      setIsChecking(false);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [username, checkAvailability]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAvailable) {
      // Save username to localStorage to persist across auth flow
      if (typeof window !== 'undefined') {
        localStorage.setItem("claimedUsername", username);
      }
      router.push(`/signup?username=${username}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="relative flex items-center">
        <div className="absolute left-4 z-10 text-muted-foreground font-medium select-none">
          oneurl.live/
        </div>
        <input
          type="text"
          value={username}
          onChange={(e) => {
            const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
            setUsername(value);
          }}
          placeholder="username"
          className={cn(
            "h-14 w-full bg-background border-2 border-primary focus:outline-none pl-32 pr-12 font-medium text-lg transition-colors placeholder:text-muted-foreground/50",
            isAvailable === false && "border-red-500",
            isAvailable === true && "border-green-500"
          )}
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
        <div className="absolute right-4 z-10">
            {isChecking && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
            {!isChecking && isAvailable === true && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            {!isChecking && isAvailable === false && <XCircle className="h-5 w-5 text-red-500" />}
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="h-14 w-full mt-4 rounded-none text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
        disabled={!isAvailable || isChecking}
      >
        Claim your URL <ArrowRight className="ml-2 h-5 w-5" />
      </Button>

      <div className="mt-2 h-5 text-sm font-medium">
        {error && <span className="text-red-500">{error}</span>}
        {!error && isAvailable === true && (
          <span className="text-green-600">Username is available!</span>
        )}
      </div>
    </form>
  );
}

