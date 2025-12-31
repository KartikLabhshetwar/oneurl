"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogPanel,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Field, FieldLabel, FieldControl, FieldError } from "@/components/ui/field";
import { linkSchema } from "@/lib/validations/schemas";
import { toastError } from "@/lib/toast";
import type { Link } from "@/lib/hooks/use-links";

interface LinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { title: string; url: string }) => Promise<void>;
  isPending?: boolean;
  initialData?: Link | null;
  title: string;
  description: string;
  submitLabel?: string;
}

export function LinkDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending = false,
  initialData,
  title,
  description,
  submitLabel = "Add Link",
}: LinkDialogProps) {
  const [formTitle, setFormTitle] = useState(initialData?.title ?? "");
  const [formUrl, setFormUrl] = useState(initialData?.url ?? "");
  const [titleError, setTitleError] = useState("");
  const [urlError, setUrlError] = useState("");

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      if (initialData) {
        setFormTitle(initialData.title);
        setFormUrl(initialData.url);
      } else {
        setFormTitle("");
        setFormUrl("");
      }
      setTitleError("");
      setUrlError("");
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTitleError("");
    setUrlError("");

    try {
      const validated = linkSchema.parse({ title: formTitle, url: formUrl });
      await onSubmit(validated);
      if (!initialData) {
        setFormTitle("");
        setFormUrl("");
      }
    } catch (error) {
      if (error && typeof error === "object" && "issues" in error) {
        const zodError = error as { issues: Array<{ path: (string | number)[]; message: string }> };
        zodError.issues.forEach((issue) => {
          if (issue.path[0] === "title") {
            setTitleError(issue.message);
          } else if (issue.path[0] === "url") {
            setUrlError(issue.message);
          }
        });
        const firstError = zodError.issues[0]?.message || "Invalid input";
        toastError("Invalid input", firstError);
      }
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    if (!initialData) {
      setFormTitle("");
      setFormUrl("");
    }
    setTitleError("");
    setUrlError("");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form onSubmit={handleSubmit}>
          <DialogPanel>
            <div className="space-y-4 py-2">
              <Field>
                <FieldLabel htmlFor="link-title">Title</FieldLabel>
                <FieldControl
                  render={(props) => (
                    <Input
                      {...props}
                      id="link-title"
                      value={formTitle}
                      onChange={(e) => {
                        setFormTitle(e.target.value);
                        setTitleError("");
                      }}
                      placeholder="e.g., My Portfolio"
                      aria-invalid={titleError ? "true" : undefined}
                      disabled={isPending}
                      autoFocus
                    />
                  )}
                />
                {titleError && <FieldError>{titleError}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="link-url">URL</FieldLabel>
                <FieldControl
                  render={(props) => (
                    <Input
                      {...props}
                      id="link-url"
                      type="url"
                      value={formUrl}
                      onChange={(e) => {
                        setFormUrl(e.target.value);
                        setUrlError("");
                      }}
                      placeholder="https://example.com"
                      aria-invalid={urlError ? "true" : undefined}
                      disabled={isPending}
                    />
                  )}
                />
                {urlError && <FieldError>{urlError}</FieldError>}
              </Field>
            </div>
          </DialogPanel>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? initialData
                  ? "Saving..."
                  : "Adding..."
                : submitLabel}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

