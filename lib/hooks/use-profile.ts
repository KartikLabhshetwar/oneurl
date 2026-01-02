"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toastSuccess, toastError } from "@/lib/toast";
import { fetchFromBackend } from "@/lib/utils/api-client";

export type Profile = {
  name: string;
  bio: string;
  username: string;
  avatarUrl: string | null;
  profile?: {
    title?: string | null;
    calLink?: string | null;
  } | null;
};

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetchFromBackend("/api/profile");
      if (!res.ok) {
        throw new Error("Failed to fetch profile");
      }
      const data = await res.json();
      return data as Profile;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name?: string; bio?: string; username?: string; calLink?: string | null }) => {
      const res = await fetchFromBackend("/api/profile", {
        method: "PATCH",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      return res.json();
    },
    onSuccess: () => {
      toastSuccess("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (err) => {
      toastError("Failed to update profile", err.message);
    },
  });
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (avatarUrl: string) => {
      const res = await fetchFromBackend("/api/profile/avatar", {
        method: "POST",
        body: JSON.stringify({ avatarUrl }),
      });

      if (!res.ok) {
        throw new Error("Failed to update avatar");
      }

      return res.json();
    },
    onSuccess: () => {
      toastSuccess("Avatar updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => {
      toastError("Failed to update avatar");
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetchFromBackend("/api/profile", {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete account");
      }

      return res.json();
    },
    onSuccess: () => {
      window.location.href = "/";
    },
    onError: (err) => {
      toastError("Failed to delete account", err.message);
    },
  });
}

