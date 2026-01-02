import { db } from "../config/db";
import { createHash } from "crypto";

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_CLICKS = 10;
const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;

const BOT_USER_AGENTS = [
  "bot", "crawler", "spider", "scraper", "curl", "wget", "python", "java",
  "go-http", "httpie", "postman", "insomnia", "headless", "phantom", "selenium",
  "webdriver", "puppeteer", "playwright", "googlebot", "bingbot", "slurp",
  "duckduckbot", "baiduspider", "yandexbot", "sogou", "exabot", "facebot",
  "ia_archiver", "archive.org_bot", "msnbot", "ahrefs", "semrush", "mj12bot",
];

function generateSessionFingerprint(
  ipAddress: string | null,
  userAgent: string | null,
  headers: Record<string, string | null>
): string {
  const components = [
    ipAddress || "unknown",
    userAgent || "unknown",
    headers["accept-language"] || "",
    headers["accept-encoding"] || "",
  ].join("|");

  return createHash("sha256").update(components).digest("hex").substring(0, 16);
}

function generateIdempotencyKey(
  linkId: string,
  sessionFingerprint: string,
  timestamp: number,
  clientId?: string
): string {
  const key = `${linkId}:${sessionFingerprint}:${timestamp}:${clientId || ""}`;
  return createHash("sha256").update(key).digest("hex").substring(0, 32);
}

function isBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot));
}

function detectDevice(userAgent: string | null): string | null {
  if (!userAgent) return null;
  if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    return "mobile";
  }
  if (/Tablet|iPad|PlayBook|Silk/i.test(userAgent)) {
    return "tablet";
  }
  return "desktop";
}

function detectBrowser(userAgent: string | null): string | null {
  if (!userAgent) return null;
  const ua = userAgent.toLowerCase();
  if (ua.includes("edg/")) return "edge";
  if (ua.includes("chrome/") && !ua.includes("edg/")) {
    if (/Mobile|Android/i.test(userAgent)) return "mobile chrome";
    return "chrome";
  }
  if (ua.includes("firefox/")) return "firefox";
  if (ua.includes("safari/") && !ua.includes("chrome/")) {
    if (/Mobile|iPhone|iPad/i.test(userAgent)) return "mobile safari";
    return "safari";
  }
  if (ua.includes("opera/") || ua.includes("opr/")) return "opera";
  if (ua.includes("msie") || ua.includes("trident/")) return "ie";
  if (ua.includes("twitter")) return "twitter";
  if (ua.includes("linkedin")) return "linkedin";
  if (ua.includes("facebook")) return "facebook";
  return "other";
}

function detectOperatingSystem(userAgent: string | null): string | null {
  if (!userAgent) return null;
  
  if (/windows nt 10/i.test(userAgent)) return "windows";
  if (/windows nt 6.3/i.test(userAgent)) return "windows";
  if (/windows nt 6.2/i.test(userAgent)) return "windows";
  if (/windows nt 6.1/i.test(userAgent)) return "windows";
  if (/windows/i.test(userAgent)) return "windows";
  
  if (/macintosh|mac os x/i.test(userAgent)) return "macos";
  
  if (/android/i.test(userAgent)) return "android";
  
  if (/iphone|ipad|ipod/i.test(userAgent)) return "ios";
  
  if (/linux/i.test(userAgent)) {
    if (/ubuntu/i.test(userAgent)) return "ubuntu";
    return "linux";
  }
  
  if (/cros/i.test(userAgent)) return "chrome os";
  
  return "other";
}

function parseUTMParameters(url: string | null): {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
} {
  if (!url) return {};
  
  try {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;
    
    return {
      utmSource: params.get("utm_source") || undefined,
      utmMedium: params.get("utm_medium") || undefined,
      utmCampaign: params.get("utm_campaign") || undefined,
      utmTerm: params.get("utm_term") || undefined,
      utmContent: params.get("utm_content") || undefined,
    };
  } catch {
    return {};
  }
}

function extractReferrerDomain(referrer: string | null): string | null {
  if (!referrer) return "direct";
  
  try {
    const url = new URL(referrer);
    const hostname = url.hostname.toLowerCase();
    
    if (hostname.includes("twitter.com") || hostname.includes("x.com")) return "twitter";
    if (hostname.includes("linkedin.com")) return "linkedin";
    if (hostname.includes("facebook.com")) return "facebook";
    if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) return "youtube";
    if (hostname.includes("google.com") || hostname.includes("google.co")) return "google";
    if (hostname.includes("bing.com")) return "bing";
    if (hostname.includes("reddit.com")) return "reddit";
    if (hostname.includes("instagram.com")) return "instagram";
    
    return hostname;
  } catch {
    return referrer;
  }
}

export interface TrackingData {
  linkId: string;
  ipAddress: string | null;
  userAgent: string | null;
  referrer: string | null;
  country: string | null;
  headers: Record<string, string | null>;
  clientId?: string;
  url?: string | null;
}

export interface TrackingResult {
  success: boolean;
  tracked: boolean;
  reason?: string;
  idempotencyKey?: string;
}

export const trackingService = {
  async trackClick(data: TrackingData): Promise<TrackingResult> {
    const { linkId, ipAddress, userAgent, referrer, country, headers, clientId, url } = data;

    const sessionFingerprint = generateSessionFingerprint(ipAddress, userAgent, headers);
    const now = Date.now();
    const idempotencyKey = generateIdempotencyKey(linkId, sessionFingerprint, now, clientId);

    try {
      const existingClick = await db.linkClick.findUnique({
        where: { idempotencyKey },
      });

      if (existingClick) {
        return {
          success: true,
          tracked: false,
          reason: "duplicate",
          idempotencyKey,
        };
      }

      const recentDuplicate = await db.linkClick.findFirst({
        where: {
          linkId,
          sessionFingerprint,
          clickedAt: {
            gte: new Date(now - DUPLICATE_WINDOW_MS),
          },
        },
        orderBy: { clickedAt: "desc" },
      });

      if (recentDuplicate) {
        return {
          success: true,
          tracked: false,
          reason: "rate_limited_duplicate",
          idempotencyKey,
        };
      }

      const recentClicks = await db.linkClick.count({
        where: {
          linkId,
          sessionFingerprint,
          clickedAt: {
            gte: new Date(now - RATE_LIMIT_WINDOW_MS),
          },
        },
      });

      if (recentClicks >= RATE_LIMIT_MAX_CLICKS) {
        return {
          success: true,
          tracked: false,
          reason: "rate_limited",
          idempotencyKey,
        };
      }

      const botDetected = isBot(userAgent);
      const device = detectDevice(userAgent);
      const browser = detectBrowser(userAgent);
      const operatingSystem = detectOperatingSystem(userAgent);
      const utmParams = parseUTMParameters(url || referrer);
      const referrerDomain = extractReferrerDomain(referrer);

      await db.linkClick.create({
        data: {
          linkId,
          referrer: referrerDomain || undefined,
          country: country || undefined,
          device: device || undefined,
          browser: browser || undefined,
          operatingSystem: operatingSystem || undefined,
          utmSource: utmParams.utmSource,
          utmMedium: utmParams.utmMedium,
          utmCampaign: utmParams.utmCampaign,
          utmTerm: utmParams.utmTerm,
          utmContent: utmParams.utmContent,
          ipAddress: ipAddress || undefined,
          userAgent: userAgent || undefined,
          sessionFingerprint,
          idempotencyKey,
          isBot: botDetected,
        },
      });

      return {
        success: true,
        tracked: true,
        idempotencyKey,
      };
    } catch (error) {
      if (error && typeof error === "object" && "code" in error) {
        const prismaError = error as { code: string };
        if (prismaError.code === "P2002") {
          return {
            success: true,
            tracked: false,
            reason: "duplicate",
            idempotencyKey,
          };
        }
      }

      console.error("Tracking error:", error);
      return {
        success: false,
        tracked: false,
        reason: "database_error",
        idempotencyKey,
      };
    }
  },

  async trackClickWithRetry(
    data: TrackingData,
    maxRetries = 3,
    retryDelay = 1000
  ): Promise<TrackingResult> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay * attempt));
      }

      try {
        const result = await this.trackClick(data);
        if (result.success) {
          return result;
        }
        if (result.reason !== "database_error") {
          return result;
        }
      } catch {
        if (attempt === maxRetries - 1) {
          break;
        }
      }
    }

    return {
      success: false,
      tracked: false,
      reason: "max_retries_exceeded",
    };
  },
};

