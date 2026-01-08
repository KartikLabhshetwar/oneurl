"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPanel,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Field, FieldLabel, FieldControl, FieldError } from "@/components/ui/field";
import { linkSchema } from "@/lib/validations/schemas";
import { toastError } from "@/lib/toast";

type IconLinkDialogLink = {
  id: string;
  title: string;
  url: string;
  icon?: string | null;
  position?: number;
  isActive?: boolean;
};

function getSocialIconTitle(url: string): string {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes("github")) return "GitHub";
  if (lowerUrl.includes("twitter") || lowerUrl.includes("x.com")) return "X (formerly Twitter)";
  if (lowerUrl.includes("linkedin")) return "LinkedIn";
  if (lowerUrl.includes("medium")) return "Medium";
  if (lowerUrl.includes("youtube")) return "YouTube";
  if (lowerUrl.includes("instagram")) return "Instagram";
  if (lowerUrl.includes("leetcode")) return "LeetCode";
  if (lowerUrl.includes("codeforces")) return "Codeforces";
  if (lowerUrl.includes("codechef")) return "CodeChef";
  return "Social Media";
}

function extractHandle(url: string): string {
  try {
    const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
    const pathname = urlObj.pathname;
    let handle = pathname.replace(/^\//, "").replace(/\/$/, "");

    if (handle.startsWith("@")) {
      handle = handle.substring(1);
    }

    if (handle.startsWith("in/")) {
      handle = handle.substring(3);
    }

    return handle || "";
  } catch {
    return "";
  }
}

function buildUrlFromHandle(handle: string, originalUrl: string): string {
  try {
    const urlObj = new URL(originalUrl.startsWith("http") ? originalUrl : `https://${originalUrl}`);
    const domain = urlObj.hostname.toLowerCase();

    const cleanHandle = handle.trim().replace(/^@/, "");

    if (domain.includes("twitter") || domain.includes("x.com")) {
      return `https://x.com/${cleanHandle}`;
    }
    if (domain.includes("github")) {
      return `https://github.com/${cleanHandle}`;
    }
    if (domain.includes("linkedin")) {
      return `https://linkedin.com/in/${cleanHandle}`;
    }
    if (domain.includes("medium")) {
      return `https://medium.com/@${cleanHandle}`;
    }
    if (domain.includes("youtube")) {
      return `https://youtube.com/@${cleanHandle}`;
    }
    if (domain.includes("instagram")) {
      return `https://instagram.com/${cleanHandle}`;
    }
    if (domain.includes("threads")) {
      return `https://threads.net/${cleanHandle}`;
    }
    if (domain.includes("youtube")) {
      return `https://youtube.com/@${cleanHandle}`;
    }
    if (domain.includes("tiktok")) {
      return `https://tiktok.com/@${cleanHandle}`;
    }
    if (domain.includes("leetcode")) {
      return `https://leetcode.com/u/${cleanHandle}`;
    }
    if (domain.includes("codeforces")) {
      return `https://codeforces.com/profile/${cleanHandle}`;
    }
    if (domain.includes("codechef")) {
      return `https://codechef.com/users/${cleanHandle}`;
    }

    return originalUrl;
  } catch {
    return originalUrl;
  }
}

interface IconLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { title: string; url: string; icon?: string | null }) => Promise<void>;
  onRemove: () => Promise<void>;
  isPending?: boolean;
  link: IconLinkDialogLink | null;
}

export function IconLinkDialog({
  open,
  onOpenChange,
  onSave,
  onRemove,
  isPending = false,
  link,
}: IconLinkDialogProps) {
  const [handle, setHandle] = useState("");
  const [handleError, setHandleError] = useState("");
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (open && link) {
      const extractedHandle = extractHandle(link.url);
      setHandle(extractedHandle);
      setHandleError("");
    } else if (!open) {
      setHandle("");
      setHandleError("");
      setIsRemoving(false);
    }
  }, [open, link]);

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHandleError("");

    if (!handle.trim()) {
      setHandleError("Handle is required");
      return;
    }

    if (!link) return;

    try {
      const newUrl = buildUrlFromHandle(handle.trim(), link.url);
      const validated = linkSchema.parse({
        title: link.title,
        url: newUrl,
        icon: link.icon || "🔗"
      });
      await onSave({
        title: validated.title,
        url: validated.url,
        icon: validated.icon ?? null
      });
      onOpenChange(false);
    } catch (error) {
      if (error && typeof error === "object" && "issues" in error) {
        const zodError = error as { issues: Array<{ path: (string | number)[]; message: string }> };
        zodError.issues.forEach((issue) => {
          if (issue.path[0] === "url") {
            setHandleError(issue.message);
          }
        });
        const firstError = zodError.issues[0]?.message || "Invalid input";
        toastError("Invalid input", firstError);
      }
    }
  };

  const handleRemove = async () => {
    if (!link) return;
    setIsRemoving(true);
    try {
      await onRemove();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to remove icon:", error);
    } finally {
      setIsRemoving(false);
    }
  };

  if (!link) return null;

  const iconTitle = getSocialIconTitle(link.url);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handleOpenChange(false)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <DialogTitle className="flex-1 text-center px-4">
              Edit {iconTitle} icon
            </DialogTitle>
            <div className="w-8" />
          </div>
        </DialogHeader>
        <Form onSubmit={handleSubmit}>
          <DialogPanel>
            <div className="space-y-6 py-4">
              <Field>
                <FieldLabel htmlFor="handle">
                  Handle<span className="text-destructive">*</span>
                </FieldLabel>
                <FieldControl
                  render={(props) => (
                    <Input
                      {...props}
                      id="handle"
                      value={handle}
                      onChange={(e) => {
                        setHandle(e.target.value);
                        setHandleError("");
                      }}
                      placeholder="username"
                      aria-invalid={handleError ? "true" : undefined}
                      disabled={isPending || isRemoving}
                      autoFocus
                    />
                  )}
                />
                {handleError && <FieldError>{handleError}</FieldError>}
              </Field>

              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={isPending || isRemoving}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isPending ? "Saving..." : "Save"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRemove}
                  disabled={isPending || isRemoving}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove icon
                </Button>
              </div>
            </div>
          </DialogPanel>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

