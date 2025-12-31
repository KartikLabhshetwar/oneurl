"use client";

import { useState } from "react";
import { Link2, Plus, Edit, Trash2, Power, PowerOff } from "lucide-react";
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
import {
  useLinks,
  useCreateLink,
  useUpdateLink,
  useDeleteLink,
  type Link,
} from "@/lib/hooks/use-links";

export default function LinksPage() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [linkToEdit, setLinkToEdit] = useState<Link | null>(null);
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);
  const [linkToggling, setLinkToggling] = useState<string | null>(null);

  const { data: links = [], isLoading } = useLinks();
  const createLink = useCreateLink();
  const updateLink = useUpdateLink();
  const deleteLink = useDeleteLink();

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
              <div className="space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Links</h1>
          <p className="text-muted-foreground mt-2">
            Add, edit, and organize your profile links
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus />
          <span>Create New Link</span>
        </Button>
      </div>

      <div className="space-y-4">
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
                    Get started by adding your first link to your profile. Click
                    &quot;Create New Link&quot; to begin.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </CardContent>
          </Card>
        ) : (
          links.map((link) => {
            const isDeleting = deleteLink.isPending && linkToDelete === link.id;
            const isToggling = linkToggling === link.id;

            return (
              <Card
                key={link.id}
                className={isDeleting || isToggling ? "opacity-60" : ""}
              >
                <CardContent className="flex items-center justify-between p-6">
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
                    {(isDeleting || isToggling) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Processing...
                      </p>
                    )}
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
                          <PowerOff />
                          <span>Disable</span>
                        </>
                      ) : (
                        <>
                          <Power />
                          <span>Enable</span>
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditClick(link)}
                      disabled={isToggling || isDeleting}
                    >
                      <Edit />
                      <span>Edit</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive-outline"
                      onClick={() => handleDeleteClick(link.id)}
                      disabled={isToggling || isDeleting}
                    >
                      <Trash2 />
                      <span>Delete</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
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
    </div>
  );
}
