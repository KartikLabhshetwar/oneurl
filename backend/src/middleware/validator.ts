import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

const urlSchema = z.object({
  url: z.string().url("Invalid URL format").max(2048, "URL too long"),
});

export const validatePreviewRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validated = urlSchema.parse(req.query);
    req.validatedQuery = validated;
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }
    return res.status(400).json({ error: "Invalid request" });
  }
};

declare module "express-serve-static-core" {
  interface Request {
    validatedQuery?: z.infer<typeof urlSchema>;
  }
}

