import { Router, Request, Response } from "express";
import { fetchMetadata } from "../utils/metadata-fetcher.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const validated = req.validatedQuery as { url: string } | undefined;
    const url = validated?.url;
    
    if (!url) {
      return res.status(400).json({ error: "URL parameter is required" });
    }

    const metadata = await fetchMetadata(url);
    
    res.json({
      success: true,
      data: metadata,
    });
  } catch (error) {
    const err = error as Error;
    
    if (err.message === "FORBIDDEN") {
      return res.status(403).json({
        error: "Unable to fetch metadata for this URL",
        code: "FORBIDDEN",
      });
    }
    
    if (err.message === "TIMEOUT") {
      return res.status(408).json({
        error: "Request timeout",
        code: "TIMEOUT",
      });
    }
    
    if (err.message === "NOT_FOUND") {
      return res.status(404).json({
        error: "URL not found",
        code: "NOT_FOUND",
      });
    }

    throw error;
  }
});

export default router;
