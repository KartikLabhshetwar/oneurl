import { Request, Response, NextFunction } from "express";
import { z, ZodError, ZodSchema } from "zod";

const urlPreviewSchema = z.object({
  url: z.string().url("Invalid URL format").max(2048, "URL too long"),
});

export const validatePreviewRequest = (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = urlPreviewSchema.parse(req.query);
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

export const validate = <T extends ZodSchema>(schema: T, source: "body" | "query" | "params" = "body") => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = source === "body" ? req.body : source === "query" ? req.query : req.params;
      const validated = schema.parse(data);
      
      if (source === "body") {
        req.body = validated;
      } else if (source === "query") {
        req.validatedQuery = validated;
      } else {
        req.validatedParams = validated;
      }
      
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
};

export const validateBody = <T extends ZodSchema>(schema: T) => validate(schema, "body");
export const validateQuery = <T extends ZodSchema>(schema: T) => validate(schema, "query");
export const validateParams = <T extends ZodSchema>(schema: T) => validate(schema, "params");

declare module "express-serve-static-core" {
  interface Request {
    validatedQuery?: unknown;
    validatedParams?: unknown;
  }
}
