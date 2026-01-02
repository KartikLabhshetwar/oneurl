import { Router } from "express";
import { createRouteHandler } from "uploadthing/express";
import { ourFileRouter } from "../config/uploadthing";

const router = Router();

try {
  const uploadthingHandler = createRouteHandler({
    router: ourFileRouter,
  });
  
  router.use("/", uploadthingHandler);
} catch (error) {
  console.error("[UploadThing] Failed to initialize route handler:", error);
  router.use("/", (req, res) => {
    res.status(500).json({
      error: "File upload service unavailable",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  });
}

export default router;

