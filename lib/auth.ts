import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db";

const baseURL = process.env.BETTER_AUTH_URL;

const getTrustedOrigins = (): string[] => {
  const origins: string[] = [];
  
  if (baseURL) {
    origins.push(baseURL);
    const url = new URL(baseURL);
    const hostname = url.hostname;
    
    if (hostname.startsWith("www.")) {
      const nonWww = baseURL.replace("www.", "");
      origins.push(nonWww);
    } else {
      origins.push(baseURL.replace(hostname, `www.${hostname}`));
    }
  }
  
  if (process.env.NODE_ENV === "development") {
    origins.push("http://localhost:3000");
  }
  
  return origins;
};

const getCookieDomain = (): string | undefined => {
  if (!baseURL || process.env.NODE_ENV !== "production") return undefined;
  const url = new URL(baseURL);
  const hostname = url.hostname;
  
  if (hostname.startsWith("www.")) {
    return hostname.replace("www.", "");
  }
  if (hostname.includes(".") && !hostname.includes("localhost")) {
    return hostname;
  }
  return undefined;
};

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: getTrustedOrigins(),
  advanced: {
    crossSubDomainCookies: process.env.NODE_ENV === "production" ? {
      enabled: true,
      domain: getCookieDomain(),
    } : undefined,
    useSecureCookies: process.env.NODE_ENV === "production",
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});

