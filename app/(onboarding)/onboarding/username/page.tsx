"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Field, FieldLabel, FieldControl, FieldError, FieldDescription } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupInput } from "@/components/ui/input-group";
import { usernameSchema } from "@/lib/validations/schemas";
import { toastSuccess, toastError } from "@/lib/toast";

export default function UsernamePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const checkAvailability = useCallback(async (value: string) => {
    if (!value) {
      setIsAvailable(null);
      setError("");
      setIsChecking(false);
      return;
    }

    let validationError = "";
    try {
      usernameSchema.parse(value);
    } catch (e) {
      validationError = e instanceof Error ? e.message : "Invalid username";
      setError(validationError);
      setIsAvailable(false);
      setIsChecking(false);
      return;
    }

    setIsChecking(true);
    setError("");

    try {
      const res = await fetch("/api/profile/check-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAvailable) return;

    try {
      const res = await fetch("/api/profile/username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (res.ok) {
        toastSuccess("Username set", `Your username @${username} has been set successfully`);
        router.push("/onboarding/avatar");
      } else {
        const data = await res.json();
        const errorMessage = data.error || "Failed to set username";
        setError(errorMessage);
        toastError("Failed to set username", errorMessage);
      }
    } catch {
      const errorMessage = "Failed to set username";
      setError(errorMessage);
      toastError("Error", errorMessage);
    }
  };

  return (
    <div className="container mx-auto flex max-w-md flex-col items-center justify-center px-4 py-16">
      <div className="w-full space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold">Choose your username</h2>
          <p className="text-muted-foreground">
            This will be your unique profile URL: oneurl.live/{username || "username"}
          </p>
        </div>

        <Form onSubmit={handleSubmit}>
          <Field>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <FieldDescription>
              Choose a unique username for your profile URL
            </FieldDescription>
            <FieldControl
              render={(props) => (
                <InputGroup className="transition-all duration-200">
                  <InputGroupAddon align="inline-start">
                    <InputGroupText>oneurl.live/</InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    {...props}
                    id="username"
                    value={username}
                    onChange={(e) => {
                      const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
                      setUsername(value);
                    }}
                    placeholder="username"
                    aria-invalid={error ? "true" : undefined}
                    autoFocus
                  />
                  <InputGroupAddon align="inline-end">
                    <div className="flex items-center">
                      {isChecking && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground transition-opacity duration-200" />
                      )}
                      {!isChecking && isAvailable === true && (
                        <CheckCircle2 className="h-4 w-4 text-green-600 transition-opacity duration-200" />
                      )}
                      {!isChecking && isAvailable === false && error && (
                        <XCircle className="h-4 w-4 text-destructive transition-opacity duration-200" />
                      )}
                    </div>
                  </InputGroupAddon>
                </InputGroup>
              )}
            />
            <div className="min-h-[20px] transition-all duration-200">
              {error && <FieldError>{error}</FieldError>}
              {!error && isAvailable === true && (
                <FieldDescription className="text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Username is available!
                </FieldDescription>
              )}
            </div>
          </Field>

          <Button
            type="submit"
            className="w-full"
            disabled={!isAvailable || isChecking}
          >
            {isChecking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </Form>
      </div>
    </div>
  );
}

