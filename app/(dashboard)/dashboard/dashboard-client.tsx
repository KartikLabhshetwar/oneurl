"use client";

import { useState } from "react";
import type * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Link2, Plus, RefreshCw, Link2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipTrigger,
  TooltipPopup,
  TooltipProvider,
} from "@/components/ui/tooltip";
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
import { IconLinkDialog } from "@/components/icon-link-dialog";
import { ProfilePreview } from "@/components/profile-preview";
import { ShareDialog } from "@/components/share-dialog";
import { SortableDashboardIconLink } from "@/components/sortable-dashboard-icon-link";
import { SortableLinkItem } from "@/components/sortable-link-item";
import {
  useLinks,
  useCreateLink,
  useUpdateLink,
  useDeleteLink,
  useReorderLinks,
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
  const [iconLinkDialogOpen, setIconLinkDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [linkToEdit, setLinkToEdit] = useState<Link | null>(null);
  const [iconLinkToEdit, setIconLinkToEdit] = useState<Link | null>(null);
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
  const reorderLinks = useReorderLinks();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const displayProfile = profile || initialProfile;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["link-click-counts"] });
      await queryClient.refetchQueries({ queryKey: ["link-click-counts"] });
    } catch (error) {
      console.error("Failed to refresh analytics:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAdd = async (data: { title: string; url: string; icon?: string | null }) => {
    await createLink.mutateAsync(data);
    setAddDialogOpen(false);
  };

  const handleEditClick = (link: Link) => {
    setLinkToEdit(link);
    setEditDialogOpen(true);
  };

  const handleUpdate = async (data: { title: string; url: string; icon?: string | null }) => {
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

  const handleIconLinkClick = (link: Link) => {
    setIconLinkToEdit(link);
    setIconLinkDialogOpen(true);
  };

  const handleIconLinkSave = async (data: { title: string; url: string; icon?: string | null }) => {
    if (!iconLinkToEdit) return;
    await updateLink.mutateAsync({
      id: iconLinkToEdit.id,
      data,
    });
    setIconLinkDialogOpen(false);
    setIconLinkToEdit(null);
  };

  const handleIconLinkRemove = async () => {
    if (!iconLinkToEdit) return;
    await deleteLink.mutateAsync(iconLinkToEdit.id);
    setIconLinkDialogOpen(false);
    setIconLinkToEdit(null);
  };

  const handleIconLinkDialogChange = (open: boolean) => {
    if (!open) {
      setIconLinkToEdit(null);
    }
    setIconLinkDialogOpen(open);
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

  const handleToggleActive = async (id: string, newIsActive: boolean) => {
    setLinkToggling(id);
    try {
      await updateLink.mutateAsync({
        id,
        data: { isActive: newIsActive },
      });
    } catch {
      // Error handled by mutation
    } finally {
      setLinkToggling(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const mainLinks = links.filter((link) => !link.icon);
    const iconLinks = links.filter((link) => link.icon);

    const mainOldIndex = mainLinks.findIndex((link) => link.id === active.id);
    const mainNewIndex = mainLinks.findIndex((link) => link.id === over.id);
    const iconOldIndex = iconLinks.findIndex((link) => link.id === active.id);
    const iconNewIndex = iconLinks.findIndex((link) => link.id === over.id);

    if (mainOldIndex !== -1 && mainNewIndex !== -1) {
      const reorderedMainLinks = arrayMove(mainLinks, mainOldIndex, mainNewIndex);
      const allLinks = [...iconLinks, ...reorderedMainLinks];
      const linkIds = allLinks.map((link) => link.id);
      reorderLinks.mutate(linkIds);
    } else if (iconOldIndex !== -1 && iconNewIndex !== -1) {
      const reorderedIconLinks = arrayMove(iconLinks, iconOldIndex, iconNewIndex);
      const allLinks = [...reorderedIconLinks, ...mainLinks];
      const linkIds = allLinks.map((link) => link.id);
      reorderLinks.mutate(linkIds);
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
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Your Links</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your icon links and main links
              </p>
            </div>
            <TooltipProvider>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isLoadingCounts || isRefreshing}
                      >
                        <RefreshCw className={`h-4 w-4 ${isLoadingCounts || isRefreshing ? "animate-spin" : ""}`} />
                        Refresh
                      </Button> as React.ReactElement
                    }
                  />
                  <TooltipPopup>Refresh analytics data</TooltipPopup>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button onClick={() => setAddDialogOpen(true)} size="sm">
                        <Plus className="h-4 w-4" />
                        <span>Add Link</span>
                      </Button> as React.ReactElement
                    }
                  />
                  <TooltipPopup>Add a new link to your profile</TooltipPopup>
                </Tooltip>
              </div>
            </TooltipProvider>
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
            <div className="space-y-6">
              {(() => {
                const iconLinks = links.filter((link) => link.icon);
                const mainLinks = links.filter((link) => !link.icon);

                return (
                  <>
                    {iconLinks.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground">Icon Links</h3>
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd}
                        >
                          <SortableContext
                            items={iconLinks.map((link) => link.id)}
                            strategy={horizontalListSortingStrategy}
                          >
                            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin flex-nowrap">
                              {iconLinks.map((link) => {
                                const isDeleting = deleteLink.isPending && linkToDelete === link.id;
                                const isToggling = linkToggling === link.id;

                                return (
                                  <SortableDashboardIconLink
                                    key={link.id}
                                    link={link}
                                    onEdit={handleIconLinkClick}
                                    isDeleting={isDeleting}
                                    isToggling={isToggling}
                                  />
                                );
                              })}
                            </div>
                          </SortableContext>
                        </DndContext>
                      </div>
                    )}

                    {mainLinks.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground">Main Links</h3>
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd}
                        >
                          <SortableContext
                            items={mainLinks.map((link) => link.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="space-y-2">
                              {mainLinks.map((link) => {
                                const isDeleting = deleteLink.isPending && linkToDelete === link.id;
                                const isToggling = linkToggling === link.id;

                                return (
                                  <SortableLinkItem
                                    key={link.id}
                                    link={link}
                                    clickCount={clickCounts[link.id] || 0}
                                    isLoadingCounts={isLoadingCounts}
                                    isDeleting={isDeleting}
                                    isToggling={isToggling}
                                    onToggleActive={handleToggleActive}
                                    onEdit={handleEditClick}
                                    onDelete={handleDeleteClick}
                                  />
                                );
                              })}
                            </div>
                          </SortableContext>
                        </DndContext>
                      </div>
                    )}
                  </>
                );
              })()}
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

      <IconLinkDialog
        open={iconLinkDialogOpen}
        onOpenChange={handleIconLinkDialogChange}
        onSave={handleIconLinkSave}
        onRemove={handleIconLinkRemove}
        isPending={updateLink.isPending}
        link={iconLinkToEdit}
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

