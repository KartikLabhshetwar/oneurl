"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { linkSchema } from "@/lib/validations/schemas";
import { toastSuccess, toastError } from "@/lib/toast";
import { fetchFromBackend } from "@/lib/utils/api-client";

export type Link = {
  id: string;
  title: string;
  url: string;
  icon?: string | null;
  previewImageUrl?: string | null;
  previewDescription?: string | null;
  position: number;
  isActive: boolean;
};

export function useLinks() {
  return useQuery({
    queryKey: ["links"],
    queryFn: async () => {
      const res = await fetchFromBackend("/api/links");
      if (!res.ok) {
        throw new Error("Failed to fetch links");
      }
      const data = await res.json();
      return (data.links || []) as Link[];
    },
  });
}

export function useCreateLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { title: string; url: string; icon?: string | null }) => {
      const validated = linkSchema.parse(data);
      const res = await fetchFromBackend("/api/links", {
        method: "POST",
        body: JSON.stringify({ 
          title: validated.title, 
          url: validated.url,
          icon: validated.icon || null
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create link");
      }

      return res.json();
    },
    onMutate: async (newLink) => {
      await queryClient.cancelQueries({ queryKey: ["links"] });

      const previousLinks = queryClient.getQueryData<Link[]>(["links"]);

      queryClient.setQueryData<Link[]>(["links"], (old = []) => {
        const tempId = `temp-${Date.now()}`;
        return [
          ...old,
          {
            id: tempId,
            title: newLink.title,
            url: newLink.url,
            icon: newLink.icon || null,
            position: old.length,
            isActive: true,
          },
        ];
      });

      return { previousLinks };
    },
    onError: (err, newLink, context) => {
      if (context?.previousLinks) {
        queryClient.setQueryData(["links"], context.previousLinks);
      }
      toastError("Failed to add link", err.message);
    },
    onSuccess: () => {
      toastSuccess("Link added successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });
}

export function useUpdateLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { title?: string; url?: string; icon?: string | null; isActive?: boolean };
    }) => {
      const res = await fetchFromBackend(`/api/links/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update link");
      }

      return res.json();
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["links"] });

      const previousLinks = queryClient.getQueryData<Link[]>(["links"]);

      queryClient.setQueryData<Link[]>(["links"], (old = []) => {
        return old.map((link) =>
          link.id === id ? { ...link, ...data } : link
        );
      });

      return { previousLinks };
    },
    onError: (err, variables, context) => {
      if (context?.previousLinks) {
        queryClient.setQueryData(["links"], context.previousLinks);
      }
      toastError("Failed to update link", err.message);
    },
    onSuccess: (_, variables) => {
      if (variables.data.isActive !== undefined) {
        toastSuccess(
          `Link ${variables.data.isActive ? "enabled" : "disabled"} successfully`
        );
      } else if (variables.data.title || variables.data.url) {
        toastSuccess("Link updated successfully");
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });
}

export function useDeleteLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchFromBackend(`/api/links/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete link");
      }

      return res.json();
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["links"] });

      const previousLinks = queryClient.getQueryData<Link[]>(["links"]);

      queryClient.setQueryData<Link[]>(["links"], (old = []) => {
        return old.filter((link) => link.id !== id);
      });

      return { previousLinks };
    },
    onError: (err, id, context) => {
      if (context?.previousLinks) {
        queryClient.setQueryData(["links"], context.previousLinks);
      }
      toastError("Failed to delete link", err.message);
    },
    onSuccess: () => {
      toastSuccess("Link deleted successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });
}

export function useReorderLinks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (linkIds: string[]) => {
      const res = await fetchFromBackend("/api/links/reorder", {
        method: "POST",
        body: JSON.stringify({ linkIds }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to reorder links");
      }

      return res.json();
    },
    onMutate: async (linkIds) => {
      await queryClient.cancelQueries({ queryKey: ["links"] });

      const previousLinks = queryClient.getQueryData<Link[]>(["links"]);

      queryClient.setQueryData<Link[]>(["links"], (old = []) => {
        const linkMap = new Map(old.map((link) => [link.id, link]));
        return linkIds.map((id) => linkMap.get(id)).filter(Boolean) as Link[];
      });

      return { previousLinks };
    },
    onError: (err, linkIds, context) => {
      if (context?.previousLinks) {
        queryClient.setQueryData(["links"], context.previousLinks);
      }
      toastError("Failed to reorder links", err.message);
    },
    onSuccess: () => {
      toastSuccess("Links reordered successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["links"] });
    },
  });
}

