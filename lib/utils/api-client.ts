const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export function getBackendUrl(path: string): string {
  return `${BACKEND_URL}${path}`;
}

export async function fetchFromBackend(path: string, options?: RequestInit): Promise<Response> {
  return fetch(getBackendUrl(path), {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
}

