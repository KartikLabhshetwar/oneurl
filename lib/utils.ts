import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAvatarUrl(user: { avatarUrl?: string | null; image?: string | null }): string | null {
  return user.avatarUrl || user.image || null
}
