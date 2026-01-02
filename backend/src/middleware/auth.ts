import { Request, Response, NextFunction } from "express";
import { auth } from "../config/auth";

interface AuthenticatedRequest extends Request {
  session?: Awaited<ReturnType<typeof auth.api.getSession>>;
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as unknown as Headers,
    });

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.session = session;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
