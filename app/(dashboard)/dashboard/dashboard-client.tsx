"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link2, Plus, Edit, Trash2, Power, PowerOff, BarChart3, RefreshCw, Link2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogClose,
} from "@/components/ui/alert-dialog";
import { LinkDialog } from "@/components/link-dialog";
import { ProfilePreview } from "@/components/profile-preview";
import { ShareDialog } from "@/components/share-dialog";
import {
  useLinks,
  useCreateLink,
  useUpdateLink,
  useDeleteLink,
  type Link,
} from "@/lib/hooks/use-links";
import { useLinkClickCounts } from "@/lib/hooks/use-link-analytics";
import { useProfile } from "@/lib/hooks/use-profile";

interface DashboardClientProps {
  initialProfile: {
    name: string;
    username: string | null;
    bio: string | null;
    avatarUrl: string | null;
  };
}

export function DashboardClient({ initialProfile }: DashboardClientProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [linkToEdit, setLinkToEdit] = useState<Link | null>(null);
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);
  const [linkToggling, setLinkToggling] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: profile } = useProfile();
  const { data: links = [], isLoading } = useLinks();
  const { data: clickCounts = {}, isLoading: isLoadingCounts } = useLinkClickCounts();
  const createLink = useCreateLink();
  const updateLink = useUpdateLink();
  const deleteLink = useDeleteLink();

  const displayProfile = profile || initialProfile;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["link-click-counts"] }),
        queryClient.refetchQueries({ queryKey: ["link-click-counts"] }),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAdd = async (data: { title: string; url: string }) => {
    await createLink.mutateAsync(data);
    setAddDialogOpen(false);
  };

  const handleEditClick = (link: Link) => {
    setLinkToEdit(link);
    setEditDialogOpen(true);
  };

  const handleUpdate = async (data: { title: string; url: string }) => {
    if (!linkToEdit) return;
    await updateLink.mutateAsync({
      id: linkToEdit.id,
      data,
    });
    setEditDialogOpen(false);
    setLinkToEdit(null);
  };

  const handleEditDialogChange = (open: boolean) => {
    if (!open) {
      setLinkToEdit(null);
    }
    setEditDialogOpen(open);
  };

  const handleDeleteClick = (id: string) => {
    setLinkToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!linkToDelete) return;
    try {
      await deleteLink.mutateAsync(linkToDelete);
      setDeleteDialogOpen(false);
      setLinkToDelete(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    setLinkToggling(id);
    try {
      await updateLink.mutateAsync({
        id,
        data: { isActive: !isActive },
      });
    } catch {
      // Error handled by mutation
    } finally {
      setLinkToggling(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your links and see a live preview of your profile
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Links</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoadingCounts || isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingCounts || isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button onClick={() => setAddDialogOpen(true)} size="sm">
                <Plus className="h-4 w-4" />
                <span>Add Link</span>
              </Button>
            </div>
          </div>

          {links.length === 0 ? (
            <Card>
              <CardContent className="p-12">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Link2 />
                    </EmptyMedia>
                    <EmptyTitle>No links yet</EmptyTitle>
                    <EmptyDescription>
                      Get started by adding your first link. Click &quot;Add Link&quot; to begin.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {links.map((link) => {
                const isDeleting = deleteLink.isPending && linkToDelete === link.id;
                const isToggling = linkToggling === link.id;

                return (
                  <Card
                    key={link.id}
                    className={isDeleting || isToggling ? "opacity-60" : ""}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium truncate">{link.title}</p>
                          <Badge
                            variant={link.isActive ? "success" : "outline"}
                            size="sm"
                          >
                            {link.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {link.url}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          {isLoadingCounts ? (
                            <Skeleton className="h-4 w-16" />
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <BarChart3 className="h-3 w-3" />
                              <span>
                                {clickCounts[link.id] || 0} {clickCounts[link.id] === 1 ? "click" : "clicks"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleActive(link.id, link.isActive)}
                          disabled={isToggling || isDeleting}
                        >
                          {link.isActive ? (
                            <>
                              <PowerOff className="h-4 w-4" />
                            </>
                          ) : (
                            <>
                              <Power className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(link)}
                          disabled={isToggling || isDeleting}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive-outline"
                          onClick={() => handleDeleteClick(link.id)}
                          disabled={isToggling || isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-8 lg:h-fit">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-1">Live Preview</h2>
            <p className="text-sm text-muted-foreground mb-4">
              See how your profile looks to visitors
            </p>
            {displayProfile.username && (
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center gap-2 rounded-full border bg-background px-4 py-2.5 shadow-sm max-w-sm w-full">
                  <span className="flex-1 font-medium text-sm text-foreground truncate">
                    oneurl.live/{displayProfile.username}
                  </span>
                  <button
                    onClick={() => setShareDialogOpen(true)}
                    className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-accent transition-colors shrink-0"
                    aria-label="Share"
                  >
                    <Link2Icon className="h-4 w-4 text-foreground" />
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="bg-gradient-to-b from-background to-muted/20 p-4 rounded-lg overflow-auto max-h-[calc(100vh-200px)]">
            <ProfilePreview
              name={displayProfile.name}
              username={displayProfile.username}
              bio={displayProfile.bio}
              avatarUrl={displayProfile.avatarUrl}
              title={profile?.profile?.title || null}
              links={links}
              calLink={profile?.profile?.calLink || null}
            />
          </div>
        </div>
      </div>

      <LinkDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAdd}
        isPending={createLink.isPending}
        title="Add New Link"
        description="Add a new link to your profile. Enter a title and URL."
        submitLabel="Add Link"
      />

      <LinkDialog
        open={editDialogOpen}
        onOpenChange={handleEditDialogChange}
        onSubmit={handleUpdate}
        isPending={updateLink.isPending}
        initialData={linkToEdit}
        title="Edit Link"
        description="Update the title and URL for this link."
        submitLabel="Save Changes"
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Link</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this link? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose>
              <Button variant="outline" disabled={deleteLink.isPending}>
                Cancel
              </Button>
            </AlertDialogClose>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteLink.isPending}
            >
              {deleteLink.isPending ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        name={displayProfile.name}
        username={displayProfile.username}
        avatarUrl={displayProfile.avatarUrl}
      />
    </div>
  );
}

