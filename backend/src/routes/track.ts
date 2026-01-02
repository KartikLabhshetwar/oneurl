import { Router } from "express";
import { trackingService } from "../services/tracking.service";
import { db } from "../config/db";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { linkId, clientId } = req.body;

    if (!linkId) {
      return res.status(400).json({ error: "Missing linkId" });
    }

    const link = await db.link.findUnique({
      where: { id: linkId },
      select: { id: true, isActive: true },
    });

    if (!link || !link.isActive) {
      return res.status(404).json({ error: "Link not found or inactive" });
    }

    const dnt = req.get("dnt");
    
    if (dnt === "1") {
      return res.json({ 
        success: true, 
        tracked: false, 
        reason: "do_not_track" 
      });
    }

    const referrer = req.get("referer") || null;
    const userAgent = req.get("user-agent") || null;
    const ipAddress = req.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                      req.get("x-real-ip") ||
                      null;

    const country = req.get("cf-ipcountry") || 
                    req.get("x-vercel-ip-country") || 
                    null;

    const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

    const allHeaders: Record<string, string | null> = {
      "accept-language": req.get("accept-language"),
      "accept-encoding": req.get("accept-encoding"),
    };

    const result = await trackingService.trackClickWithRetry({
      linkId,
      ipAddress,
      userAgent,
      referrer,
      country,
      headers: allHeaders,
      clientId: clientId || undefined,
      url,
    });

    if (!result.success && result.reason === "max_retries_exceeded") {
      return res.status(503).json({ 
        success: false, 
        error: "Tracking temporarily unavailable",
        retry: true 
      });
    }

    res.json({
      success: result.success,
      tracked: result.tracked,
      reason: result.reason,
      idempotencyKey: result.idempotencyKey,
    });
  } catch (error) {
    console.error("Error tracking click:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to track click",
      retry: true 
    });
  }
});

export default router;

