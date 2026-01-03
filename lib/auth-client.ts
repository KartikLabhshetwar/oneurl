"use client";

import { createAuthClient } from "better-auth/react";

const getBaseURL = (): string | undefined => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});

