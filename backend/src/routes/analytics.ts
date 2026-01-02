import { Router, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { analyticsService } from "../services/analytics.service";
import { db } from "../config/db";
import { AuthenticatedRequest } from "../types/express";

const router = Router();

router.get("/", requireAuth, async (req, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const profile = await db.profile.findUnique({
      where: { userId: authReq.session!.user.id },
    });

    if (!profile) {
      return res.json({
        totalClicks: 0,
        topLinks: [],
        clicksOverTime: [],
      });
    }

    const linkId = req.query.linkId as string;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    if (linkId) {
      const link = await db.link.findFirst({
        where: { id: linkId, profileId: profile.id },
      });

      if (!link) {
        return res.status(404).json({ error: "Link not found" });
      }

      const stats = await analyticsService.getLinkStats(
        linkId,
        startDate,
        endDate
      );

      return res.json(stats);
    }

    const stats = await analyticsService.getProfileStats(
      profile.id,
      startDate,
      endDate
    );

    res.json(stats);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

router.get("/links", requireAuth, async (req, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const profile = await db.profile.findUnique({
      where: { userId: authReq.session!.user.id },
    });

    if (!profile) {
      return res.json({ counts: {} });
    }

    const links = await db.link.findMany({
      where: { profileId: profile.id },
      select: { id: true },
    });

    const linkIds = links.map((l) => l.id);
    const counts = await analyticsService.getLinksClickCounts(linkIds);

    res.json({ counts });
  } catch (error) {
    console.error("Error fetching link counts:", error);
    res.status(500).json({ error: "Failed to fetch link counts" });
  }
});

export default router;
