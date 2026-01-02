import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { linkService } from "../services/link.service";
import { db } from "../config/db";
import { linkSchema, linkUpdateSchema } from "../utils/validations";
import { z } from "zod";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const session = (req as any).session;
    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return res.json({ links: [] });
    }

    const links = await linkService.getByProfileId(profile.id);
    res.json({ links });
  } catch (error) {
    console.error("Error fetching links:", error);
    res.status(500).json({ error: "Failed to fetch links" });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const session = (req as any).session;
    const body = req.body;

    let profile = await db.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      profile = await db.profile.create({
        data: { userId: session.user.id },
      });
    }

    if (body.links && Array.isArray(body.links)) {
      await db.link.deleteMany({
        where: { profileId: profile.id },
      });

      const createdLinks = await Promise.all(
        body.links.map(async (link: { title: string; url: string; icon?: string }, index: number) => {
          const created = await linkService.create(profile.id, {
            title: link.title,
            url: link.url,
            icon: link.icon,
          });

          return db.link.update({
            where: { id: created.id },
            data: { position: index },
          });
        })
      );

      return res.json({ links: createdLinks });
    }

    const validated = linkSchema.parse(body);
    const link = await linkService.create(profile.id, validated);

    res.json({ link });
  } catch (error) {
    if (error && typeof error === "object" && "issues" in error) {
      const zodError = error as { issues: Array<{ path: string[]; message: string }> };
      const firstError = zodError.issues[0];
      return res.status(400).json({ error: firstError?.message || "Validation failed" });
    }
    console.error("Error creating link:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to create link" });
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const session = (req as any).session;
    const { id } = req.params;
    const body = req.body;

    const link = await db.link.findUnique({ where: { id } });
    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    const profile = await db.profile.findUnique({
      where: { id: link.profileId },
    });

    if (profile?.userId !== session.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const data = linkUpdateSchema.parse(body);
    await linkService.update(id, data);

    res.json({ success: true });
  } catch (error) {
    if (error && typeof error === "object" && "issues" in error) {
      const zodError = error as { issues: Array<{ path: string[]; message: string }> };
      const firstError = zodError.issues[0];
      return res.status(400).json({ error: firstError?.message || "Validation failed" });
    }
    console.error("Error updating link:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to update link" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const session = (req as any).session;
    const { id } = req.params;

    const link = await db.link.findUnique({ where: { id } });
    if (!link) {
      return res.status(404).json({ error: "Link not found" });
    }

    const profile = await db.profile.findUnique({
      where: { id: link.profileId },
    });

    if (profile?.userId !== session.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await linkService.delete(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting link:", error);
    res.status(500).json({ error: "Failed to delete link" });
  }
});

router.post("/reorder", requireAuth, async (req, res) => {
  try {
    const session = (req as any).session;
    const { linkIds } = z.object({ linkIds: z.array(z.string()) }).parse(req.body);

    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const links = await db.link.findMany({
      where: { profileId: profile.id },
      select: { id: true },
    });

    const linkIdsSet = new Set(links.map((l) => l.id));
    const validLinkIds = linkIds.filter((id) => linkIdsSet.has(id));

    if (validLinkIds.length !== linkIds.length) {
      return res.status(400).json({ error: "Invalid link IDs provided" });
    }

    await linkService.reorder(profile.id, validLinkIds);
    res.json({ success: true });
  } catch (error) {
    if (error && typeof error === "object" && "issues" in error) {
      const zodError = error as { issues: Array<{ path: string[]; message: string }> };
      const firstError = zodError.issues[0];
      return res.status(400).json({ error: firstError?.message || "Validation failed" });
    }
    console.error("Error reordering links:", error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to reorder links" });
  }
});

export default router;

