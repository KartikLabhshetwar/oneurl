"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchFromBackend } from "@/lib/utils/api-client";

export function useLinkClickCounts() {
  return useQuery({
    queryKey: ["link-click-counts"],
    queryFn: async () => {
      const res = await fetchFromBackend("/api/analytics/links");
      if (!res.ok) {
        throw new Error("Failed to fetch link click counts");
      }
      const data = await res.json();
      return (data.counts || {}) as Record<string, number>;
    },
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 30000,
    gcTime: 120000,
  });
}

export function useLinkAnalytics(linkId: string | null) {
  return useQuery({
    queryKey: ["link-analytics", linkId],
    queryFn: async () => {
      if (!linkId) return null;
      const res = await fetchFromBackend(`/api/analytics?linkId=${linkId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch link analytics");
      }
      return res.json();
    },
    enabled: !!linkId,
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 30000,
    gcTime: 120000,
  });
}

export function useProfileAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await fetchFromBackend("/api/analytics");
      if (!res.ok) {
        throw new Error("Failed to fetch analytics");
      }
      return res.json();
    },
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 30000,
    gcTime: 120000,
  });
}

