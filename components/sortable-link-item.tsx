"use client";

import type * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipTrigger,
  TooltipPopup,
  TooltipProvider,
} from "@/components/ui/tooltip";
import type { Link } from "@/lib/hooks/use-links";

interface SortableLinkItemProps {
  link: Link;
  clickCount?: number;
  isLoadingCounts?: boolean;
  isDeleting?: boolean;
  isToggling?: boolean;
  onToggleActive: (id: string, isActive: boolean) => void;
  onEdit: (link: Link) => void;
  onDelete: (id: string) => void;
}

export function SortableLinkItem({
  link,
  clickCount = 0,
  isLoadingCounts = false,
  isDeleting = false,
  isToggling = false,
  onToggleActive,
  onEdit,
  onDelete,
}: SortableLinkItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const gripElement = (
    <div
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing touch-none flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
    >
      <GripVertical className="h-5 w-5" />
    </div>
  );

  const editButton = (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 text-zinc-500 hover:text-foreground"
      onClick={() => onEdit(link)}
    >
      <Pencil className="h-4 w-4" />
    </Button>
  );

  const urlElement = (
    <p className="text-sm text-muted-foreground truncate">{link.url}</p>
  );

  const switchElement = (
    <div>
      <Switch
        checked={link.isActive}
        onCheckedChange={(checked) => onToggleActive(link.id, checked)}
        disabled={isToggling || isDeleting}
      />
    </div>
  );

  const deleteButton = (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
      onClick={() => onDelete(link.id)}
      disabled={isToggling || isDeleting}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );

  return (
    <TooltipProvider>
      <Card
        ref={setNodeRef}
        style={style}
        className={`${isDeleting || isToggling ? "opacity-60" : ""} ${isDragging ? "shadow-lg ring-2 ring-primary" : ""}`}
      >
        <CardContent className="flex items-center gap-4 p-4">
          <Tooltip>
            <TooltipTrigger render={gripElement as React.ReactElement} />
            <TooltipPopup>Drag to reorder</TooltipPopup>
          </Tooltip>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">{link.title}</p>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger render={urlElement as React.ReactElement} />
                <TooltipPopup>{link.url}</TooltipPopup>
              </Tooltip>
            </div>
            <div className="flex items-center gap-4 mt-2">
              {isLoadingCounts ? (
                <Skeleton className="h-4 w-16" />
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <BarChart3 className="h-3 w-3" />
                  <span>
                    {clickCount} {clickCount === 1 ? "click" : "clicks"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger render={switchElement as React.ReactElement} />
              <TooltipPopup>
                {link.isActive ? "Disable link" : "Enable link"}
              </TooltipPopup>
            </Tooltip>
            <div className="w-px h-6 bg-zinc-200 mx-1" />
            <Tooltip>
              <TooltipTrigger render={editButton as React.ReactElement} />
              <TooltipPopup>Edit link</TooltipPopup>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger render={deleteButton as React.ReactElement} />
              <TooltipPopup>Delete link</TooltipPopup>
            </Tooltip>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
