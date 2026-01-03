"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LinkDialog } from "@/components/link-dialog";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/toast";
import { IconLink } from "@/components/icon-link";
import type { Link } from "@/lib/hooks/use-links";

export default function LinksPage() {
  const router = useRouter();
  const [links, setLinks] = useState<Link[]>([]);
  const [globalError, setGlobalError] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Link | null>(null);

  const handleAddLink = async (data: { title: string; url: string; icon?: string | null }) => {
    if (editingLink) {
      // Update existing link
      setLinks(links.map((link) => 
        link.id === editingLink.id
          ? { ...link, title: data.title, url: data.url, icon: data.icon ?? null }
          : link
      ));
      toastSuccess("Link updated", `${data.title} has been updated`);
      setEditingLink(null);
    } else {
      // Add new link
      const newLink: Link = {
        id: `temp-${Date.now()}`,
        title: data.title,
        url: data.url,
        icon: data.icon ?? null,
        position: links.length,
        isActive: true,
      };
      setLinks([...links, newLink]);
      toastSuccess("Link added", `${data.title} has been added to your profile`);
    }
    setAddDialogOpen(false);
    setGlobalError("");
  };

  const removeLink = (id: string) => {
    const linkToRemove = links.find((link) => link.id === id);
    setLinks(links.filter((link) => link.id !== id));
    setGlobalError("");
    if (linkToRemove) {
      toastSuccess("Link removed", `${linkToRemove.title} has been removed`);
    }
  };

  const handleEditLink = (link: Link) => {
    setEditingLink(link);
    setAddDialogOpen(true);
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

      toastSuccess("Links saved", "Your links have been saved successfully");
      router.push("/onboarding/preview");
    } catch {
      const errorMessage = "Failed to save links";
      setGlobalError(errorMessage);
      toastError("Error", errorMessage);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-12">
      <div className="w-full space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight leading-tight">Add your links</h2>
          <p className="text-xs text-zinc-600">
            Add the links you want to share on your profile
          </p>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={() => {
              setEditingLink(null);
              setAddDialogOpen(true);
            }}
            variant="outline"
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Link
          </Button>
        </div>

        {globalError && (
          <p className="text-sm text-destructive text-center">{globalError}</p>
        )}

        {links.length > 0 && (
          <div className="space-y-6">
            {(() => {
              const iconLinks = links.filter((link) => !!link.icon);
              const mainLinks = links.filter((link) => !link.icon);

              return (
                <>
                  {iconLinks.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-medium text-zinc-600">Icon Links</h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        {iconLinks.map((link) => (
                          <div key={link.id} className="relative group bg-zinc-50 rounded-xl p-1 border border-zinc-100 flex items-center pr-2 gap-2">
                            <div className="pointer-events-none">
                                <IconLink 
                                    link={{ ...link, position: link.position ?? 0, isActive: link.isActive ?? true }} 
                                />
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handleEditLink(link)}
                                    className="p-1.5 hover:bg-zinc-200 rounded-lg text-zinc-500 hover:text-zinc-900 transition-colors"
                                    title="Edit"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => removeLink(link.id)}
                                    className="p-1.5 hover:bg-zinc-200 rounded-lg text-zinc-500 hover:text-red-600 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {mainLinks.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-medium text-zinc-600">Main Links</h3>
                      <div className="space-y-2">
                        {mainLinks.map((link) => (
                          <Card key={link.id} className="border-zinc-200">
                            <CardContent className="flex items-center justify-between py-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate text-xs">{link.title}</p>
                                <p className="text-xs text-zinc-500 truncate mt-0.5">{link.url}</p>
                              </div>
                              <div className="flex items-center gap-1 ml-4 shrink-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditLink(link)}
                                  className="h-8 w-8 p-0 border-zinc-200"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="destructive-outline"
                                  size="sm"
                                  onClick={() => removeLink(link.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        <LinkDialog
          open={addDialogOpen}
          onOpenChange={(open) => {
            setAddDialogOpen(open);
            if (!open) {
                 setTimeout(() => setEditingLink(null), 300);
            }
          }}
          onSubmit={handleAddLink}
          title={editingLink ? "Edit Link" : "Add New Link"}
          description={editingLink ? "Edit your link details below." : "Add a new link to your profile. Enter a title and URL."}
          submitLabel={editingLink ? "Update Link" : "Add Link"}
          initialData={editingLink}
        />

        <div className="flex justify-center pt-4">
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
