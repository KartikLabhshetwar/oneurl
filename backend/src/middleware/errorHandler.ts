import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  console.error(`[Error] ${req.method} ${req.path}:`, {
    message,
    statusCode,
    code: err.code,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  if (err.code === "FORBIDDEN") {
    return res.status(403).json({
      error: "Unable to fetch metadata for this URL",
      code: "FORBIDDEN",
    });
  }

  if (err.code === "TIMEOUT") {
    return res.status(408).json({
      error: "Request timeout",
      code: "TIMEOUT",
    });
  }

  if (err.code === "NOT_FOUND") {
    return res.status(404).json({
      error: "URL not found",
      code: "NOT_FOUND",
    });
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
  });
};

