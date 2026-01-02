"use client";

import { cloneElement, isValidElement, useCallback, ReactElement } from "react";

const STORAGE_KEY_PREFIX = "oneurl_click_";
const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;

function getOrCreateClientId(): string {
  if (typeof window === "undefined") return "";
  
  const key = "oneurl_client_id";
  let clientId = localStorage.getItem(key);
  
  if (!clientId) {
    clientId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(key, clientId);
  }
  
  return clientId;
}

function hasRecentClick(linkId: string): boolean {
  if (typeof window === "undefined") return false;
  
  const key = `${STORAGE_KEY_PREFIX}${linkId}`;
  const lastClick = localStorage.getItem(key);
  
  if (!lastClick) return false;
  
  const lastClickTime = parseInt(lastClick, 10);
  const now = Date.now();
  
  if (now - lastClickTime < DUPLICATE_WINDOW_MS) {
    return true;
  }
  
  return false;
}

function recordClick(linkId: string): void {
  if (typeof window === "undefined") return;
  
  const key = `${STORAGE_KEY_PREFIX}${linkId}`;
  localStorage.setItem(key, Date.now().toString());
  
  const allKeys = Object.keys(localStorage).filter((k) =>
    k.startsWith(STORAGE_KEY_PREFIX)
  );
  
  const now = Date.now();
  allKeys.forEach((k) => {
    const timestamp = parseInt(localStorage.getItem(k) || "0", 10);
    if (now - timestamp > DUPLICATE_WINDOW_MS) {
      localStorage.removeItem(k);
    }
  });
}

function shouldTrack(): boolean {
  if (typeof navigator === "undefined") return true;
  
  if (navigator.doNotTrack === "1" || navigator.doNotTrack === "yes") {
    return false;
  }

  const win = window as Window & { doNotTrack?: string };
  if (typeof window !== "undefined" && win.doNotTrack === "1") {
    return false;
  }

  return true;
}

async function trackClickWithRetry(
  linkId: string,
  maxRetries = 3,
  retryDelay = 1000
): Promise<void> {
  if (!shouldTrack()) {
    return;
  }

  if (hasRecentClick(linkId)) {
    return;
  }

  const clientId = getOrCreateClientId();
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId, clientId }),
        signal: AbortSignal.timeout(5000),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.tracked) {
          recordClick(linkId);
          return;
        }
        if (data.success || !data.retry) {
          return;
        }
      }

      if (response.status === 503 && attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
        continue;
      }

      if (response.status >= 400 && response.status < 500) {
        return;
      }

      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    } catch (error) {
      if (attempt === maxRetries - 1) {
        console.warn("Failed to track click after retries:", error);
      }
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }
  }
}

export default function LinkClickTracker({
  children,
  linkId,
}: {
  children: React.ReactNode;
  linkId: string;
}) {
  const handleClick = useCallback(() => {
    trackClickWithRetry(linkId).catch(() => {});
  }, [linkId]);

  if (isValidElement(children)) {
    const child = children as ReactElement<{ onClick?: (e: React.MouseEvent) => void }>;
    return cloneElement(child, {
      onClick: (e: React.MouseEvent) => {
        handleClick();
        if (child.props.onClick) {
          child.props.onClick(e);
        }
      },
    });
  }

  return <>{children}</>;
}

