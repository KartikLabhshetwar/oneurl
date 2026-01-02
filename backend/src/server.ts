import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express from "express";
import cors from "cors";
import previewRouter from "./routes/preview.js";
import authRouter from "./routes/auth.js";
import uploadthingRouter from "./routes/uploadthing.js";
import linksRouter from "./routes/links.js";
import profileRouter from "./routes/profile.js";
import trackRouter from "./routes/track.js";
import analyticsRouter from "./routes/analytics.js";
import { validatePreviewRequest } from "./middleware/validator.js";
import { apiRateLimiter, strictRateLimiter } from "./middleware/rateLimiter.js";
import { requestLogger } from "./middleware/logger.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((url) => url.trim())
  : ["http://localhost:3000"];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.get("/", (req, res) => {
  res.json({
    service: "OneURL Backend API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      preview: "/api/preview?url={url}",
      auth: "/api/auth/*",
      uploadthing: "/api/uploadthing",
      links: "/api/links",
      profile: "/api/profile",
      track: "/api/track",
      analytics: "/api/analytics",
    },
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRouter);
app.use("/api/uploadthing", uploadthingRouter);
app.use("/api/links", linksRouter);
app.use("/api/profile", profileRouter);
app.use("/api/track", trackRouter);
app.use("/api/analytics", analyticsRouter);

app.use(
  "/api/preview",
  strictRateLimiter,
  apiRateLimiter,
  validatePreviewRequest,
  previewRouter
);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Server] OneURL Backend running on port ${PORT}`);
  console.log(`[Server] Environment: ${process.env.NODE_ENV || "development"}`);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("[Server] Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("[Server] Uncaught Exception:", error);
  process.exit(1);
});

