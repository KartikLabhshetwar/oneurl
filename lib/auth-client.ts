"use client";

import { createAuthClient } from "better-auth/react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3001";

export const authClient = createAuthClient({
  baseURL: `${BACKEND_URL}/api/auth`,
});

