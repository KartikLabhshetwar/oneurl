"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LinkDialog } from "@/components/link-dialog";
import { IconLinkDialog } from "@/components/icon-link-dialog";
import { Plus, Trash2 } from "lucide-react";
import { toastSuccess, toastError } from "@/lib/toast";
import { IconLink } from "@/components/icon-link";

type Link = {
  id: string;
  title: string;
  url: string;
  icon?: string | null;
  position?: number;
  isActive?: boolean;
};

export default function LinksPage() {
  const router = useRouter();
  const [links, setLinks] = useState<Link[]>([]);
  const [globalError, setGlobalError] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [iconLinkDialogOpen, setIconLinkDialogOpen] = useState(false);
  const [iconLinkToEdit, setIconLinkToEdit] = useState<Link | null>(null);

  const handleAddLink = async (data: { title: string; url: string; icon?: string | null }) => {
    const newLink: Link = {
      id: `temp-${Date.now()}`,
      title: data.title,
      url: data.url,
      icon: data.icon ?? null,
      position: links.length,
      isActive: true,
    };
    setLinks([...links, newLink]);
    setAddDialogOpen(false);
    setGlobalError("");
    toastSuccess("Link added", `${data.title} has been added to your profile`);
  };

  const removeLink = (id: string) => {
    const linkToRemove = links.find((link) => link.id === id);
    setLinks(links.filter((link) => link.id !== id));
    setGlobalError("");
    if (linkToRemove) {
      toastSuccess("Link removed", `${linkToRemove.title} has been removed`);
    }
  };

  const handleIconLinkClick = (link: Link) => {
    setIconLinkToEdit({
      ...link,
      position: link.position ?? 0,
      isActive: link.isActive ?? true,
    });
    setIconLinkDialogOpen(true);
  };

  const handleIconLinkSave = async (data: { title: string; url: string; icon?: string | null }) => {
    if (!iconLinkToEdit) return;
    setLinks(links.map(link => 
      link.id === iconLinkToEdit.id 
        ? { ...link, title: data.title, url: data.url, icon: data.icon }
        : link
    ));
    setIconLinkDialogOpen(false);
    setIconLinkToEdit(null);
  };

  const handleIconLinkRemove = async () => {
    if (!iconLinkToEdit) return;
    removeLink(iconLinkToEdit.id);
    setIconLinkDialogOpen(false);
    setIconLinkToEdit(null);
  };

  const handleContinue = async () => {
    if (links.length === 0) {
      setGlobalError("Add at least one link");
      toastError("No links added", "Please add at least one link to continue");
      return;
    }

    setGlobalError("");

    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
      const res = await fetch(`${BACKEND_URL}/api/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
            onClick={() => setAddDialogOpen(true)}
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
              const iconLinks = links.filter((link) => link.icon);
              const mainLinks = links.filter((link) => !link.icon);

              return (
                <>
                  {iconLinks.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-medium text-zinc-600">Icon Links</h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        {iconLinks.map((link) => (
                          <div key={link.id}>
                            <IconLink 
                              link={{ ...link, position: link.position ?? 0, isActive: link.isActive ?? true }} 
                              onClick={() => handleIconLinkClick(link)}
                            />
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
                              <Button
                                variant="destructive-outline"
                                size="sm"
                                onClick={() => removeLink(link.id)}
                                className="ml-4 shrink-0"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
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
          onOpenChange={setAddDialogOpen}
          onSubmit={handleAddLink}
          title="Add New Link"
          description="Add a new link to your profile. Enter a title and URL."
          submitLabel="Add Link"
        />

        <IconLinkDialog
          open={iconLinkDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIconLinkToEdit(null);
            }
            setIconLinkDialogOpen(open);
          }}
          onSave={handleIconLinkSave}
          onRemove={handleIconLinkRemove}
          isPending={false}
          link={iconLinkToEdit}
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

