import { z } from "zod";
import { sanitizeTitle, sanitizeUrl } from "../sanitize";

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be at most 20 characters")
  .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores allowed")
  .toLowerCase();

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
  icon: z.string().optional().nullable(),
  previewImageUrl: z.url().max(2048).optional().nullable(),
  previewDescription: z.string().max(500).optional().nullable(),
});

export const profileSchema = z.object({
  title: z.string().max(100, "Title must be at most 100 characters").optional(),
  bio: z.string().max(500, "Bio must be at most 500 characters").optional(),
  theme: z.string().default("default"),
  calLink: z.string().max(200, "Cal.com link must be at most 200 characters").optional().nullable(),
});

export const linkUpdateSchema = linkSchema
  .extend({
    id: z.string().optional(),
    position: z.number().int().min(0),
    isActive: z.boolean().default(true),
    previewImageUrl: z.string().url().nullable().optional(),
    previewDescription: z.string().nullable().optional(),
  })
  .partial();

