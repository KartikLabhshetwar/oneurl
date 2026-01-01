"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LinkForm, type Link } from "@/components/link-form";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldDescription, FieldControl } from "@/components/ui/field";
import { toastSuccess, toastError } from "@/lib/toast";

export default function LinksPage() {
  const router = useRouter();
  const [links, setLinks] = useState<Link[]>([]);
  const [calLink, setCalLink] = useState("");
  const [globalError, setGlobalError] = useState("");

  const handleAddLink = (link: Link) => {
    setLinks([...links, link]);
    setGlobalError("");
    toastSuccess("Link added", `${link.title} has been added to your profile`);
  };

  const removeLink = (id: string) => {
    const linkToRemove = links.find((link) => link.id === id);
    setLinks(links.filter((link) => link.id !== id));
    setGlobalError("");
    if (linkToRemove) {
      toastSuccess("Link removed", `${linkToRemove.title} has been removed`);
    }
  };

  const handleContinue = async () => {
    if (links.length === 0) {
      setGlobalError("Add at least one link");
      toastError("No links added", "Please add at least one link to continue");
      return;
    }

    setGlobalError("");

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ links }),
      });

      if (!res.ok) {
        const data = await res.json();
        const errorMessage = data.error || "Failed to save links";
        setGlobalError(errorMessage);
        toastError("Failed to save links", errorMessage);
        return;
      }

      if (calLink.trim()) {
        await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ calLink: calLink.trim() || null }),
        });
      }

      toastSuccess("Links saved", "Your links have been saved successfully");
      router.push("/onboarding/preview");
    } catch {
      const errorMessage = "Failed to save links";
      setGlobalError(errorMessage);
      toastError("Error", errorMessage);
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold">Add your links</h2>
          <p className="text-muted-foreground">
            Add the links you want to share on your profile
          </p>
        </div>

        <LinkForm onAddLink={handleAddLink} />

        {globalError && (
          <p className="text-sm text-destructive text-center">{globalError}</p>
        )}

        {links.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Your Links</h3>
            <div className="space-y-2">
              {links.map((link) => (
                <Card key={link.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{link.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{link.url}</p>
                    </div>
                    <Button
                      variant="destructive-outline"
                      size="sm"
                      onClick={() => removeLink(link.id)}
                      className="ml-4 shrink-0"
                    >
                      Remove
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Card>
          <CardContent className="pt-6">
            <Field>
              <FieldLabel htmlFor="calLink">Cal.com Link (Optional)</FieldLabel>
              <FieldDescription>
                Add your Cal.com username or full URL to enable booking on your profile
              </FieldDescription>
              <FieldControl
                render={(props) => (
                  <Input
                    {...props}
                    id="calLink"
                    value={calLink}
                    onChange={(e) => setCalLink(e.target.value)}
                    placeholder="username or https://cal.com/username"
                  />
                )}
              />
            </Field>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            onClick={handleContinue}
            size="sm"
            disabled={links.length === 0}
            className="min-w-24"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}

