import { db } from "../config/db";
import { linkSchema, linkUpdateSchema } from "../utils/validations";
import { z } from "zod";

export const linkService = {
  async getByProfileId(profileId: string) {
    return db.link.findMany({
      where: { profileId },
      orderBy: { position: "asc" },
    });
  },

  async create(profileId: string, data: z.infer<typeof linkSchema>) {
    const validated = linkSchema.parse(data);
    const count = await db.link.count({ where: { profileId } });
    return db.link.create({
      data: {
        ...validated,
        profileId,
        position: count,
      },
    });
  },

  async update(id: string, data: Partial<z.infer<typeof linkUpdateSchema>>) {
    return db.link.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return db.link.delete({
      where: { id },
    });
  },

  async reorder(profileId: string, linkIds: string[]) {
    const updates = linkIds.map((id, index) =>
      db.link.update({
        where: { id },
        data: { position: index },
      })
    );
    return Promise.all(updates);
  },

  async toggleActive(id: string, isActive: boolean) {
    return db.link.update({
      where: { id },
      data: { isActive },
    });
  },
};

