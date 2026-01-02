import { db } from "../config/db";
import { profileSchema, usernameSchema } from "../utils/validations";
import { z } from "zod";

export const profileService = {
  async getByUsername(username: string) {
    return db.user.findUnique({
      where: { username },
      include: {
        profile: {
          include: {
            links: {
              where: { isActive: true },
              orderBy: { position: "asc" },
            },
          },
        },
      },
    });
  },

  async getByUserId(userId: string) {
    return db.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            links: {
              orderBy: { position: "asc" },
            },
          },
        },
      },
    });
  },

  async checkUsernameAvailable(username: string, excludeUserId?: string) {
    const validated = usernameSchema.parse(username);
    const existing = await db.user.findUnique({
      where: { username: validated },
    });
    return !existing || existing.id === excludeUserId;
  },

  async updateUsername(userId: string, username: string) {
    const validated = usernameSchema.parse(username);
    const available = await this.checkUsernameAvailable(validated, userId);
    if (!available) {
      throw new Error("Username is already taken");
    }
    return db.user.update({
      where: { id: userId },
      data: { username: validated },
    });
  },

  async updateProfile(userId: string, data: z.infer<typeof profileSchema>) {
    const validated = profileSchema.parse(data);
    return db.profile.upsert({
      where: { userId },
      update: validated,
      create: {
        userId,
        ...validated,
      },
    });
  },

  async updateUserFields(userId: string, data: { bio?: string; avatarUrl?: string }) {
    return db.user.update({
      where: { id: userId },
      data,
    });
  },

  async publishProfile(userId: string) {
    const profile = await db.profile.findUnique({ where: { userId } });
    if (!profile) {
      throw new Error("Profile not found");
    }
    return db.profile.update({
      where: { userId },
      data: { isPublished: true },
    });
  },
};

