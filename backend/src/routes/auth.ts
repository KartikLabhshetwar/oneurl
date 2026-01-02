import { Router, Request, Response } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../config/auth";

const router = Router();

const handler = toNodeHandler(auth);

router.use((req: Request, res: Response) => {
  return handler(req, res);
});

export default router;

