import { Request, Response, NextFunction } from "express";
import { auth } from "../config/auth";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as HeadersInit,
    });

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    (req as any).session = session;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

