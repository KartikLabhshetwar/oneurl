import { z } from "zod";
import { sanitizeTitle, sanitizeUrl } from "./sanitize";

// Username validation
export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be at most 20 characters")
  .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores allowed")
  .toLowerCase();

// Link schemas
export const linkSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(800, "Title must be at most 800 characters")
    .transform((val) => sanitizeTitle(val)),
  url: z
    .string()
    .url("Invalid URL format")
    .transform((val) => sanitizeUrl(val))
    .refine((val) => val.length > 0, "Invalid URL format"),
  icon: z.string().max(50).optional().nullable(),
  previewImageUrl: z.url().max(2048).optional().nullable(),
  previewDescription: z.string().max(500).optional().nullable(),
});

export const linkUpdateSchema = linkSchema
  .extend({
    id: z.string().optional(),
    position: z.number().int().min(0),
    isActive: z.boolean().default(true),
    previewImageUrl: z.string().url().nullable().optional(),
    previewDescription: z.string().max(500).nullable().optional(),
  })
  .partial();

export const linksArraySchema = z.object({
  links: z.array(
    z.object({
      title: z.string().min(1).max(800),
      url: z.url(),
      icon: z.string().max(50).optional().nullable(),
    })
  ),
});

export const reorderLinksSchema = z.object({
  linkIds: z.array(z.string().min(1)),
});

// Profile schemas
export const profileSchema = z.object({
  title: z.string().max(100, "Title must be at most 100 characters").optional(),
  bio: z.string().max(500, "Bio must be at most 500 characters").optional(),
  theme: z.string().max(50).default("default"),
  calLink: z.string().url().max(200, "Cal.com link must be at most 200 characters").optional().nullable(),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  username: usernameSchema.optional(),
  calLink: z.string().url().max(200).optional().nullable(),
});

export const avatarSchema = z.object({
  avatarUrl: z.string().url("Invalid avatar URL"),
});

export const usernameBodySchema = z.object({
  username: usernameSchema,
});

// Track schemas
export const trackClickSchema = z.object({
  linkId: z.string().min(1, "Link ID is required"),
  clientId: z.string().optional(),
});

// URL preview schema
export const urlPreviewSchema = z.object({
  url: z.url("Invalid URL format").max(2048, "URL too long"),
});

// Param schemas
export const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export const usernameParamSchema = z.object({
  username: z.string().min(1, "Username is required"),
});
