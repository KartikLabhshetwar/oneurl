import { Router } from "express";
import { createRouteHandler } from "uploadthing/express";
import { ourFileRouter } from "../config/uploadthing";

const router = Router();

router.use(
  "/",
  createRouteHandler({
    router: ourFileRouter,
  })
);

export default router;

