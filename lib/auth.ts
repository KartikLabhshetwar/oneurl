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
    if (url.hostname.startsWith("www.")) {
      origins.push(baseURL.replace("www.", ""));
    } else {
      origins.push(baseURL.replace(url.hostname, `www.${url.hostname}`));
    }
  }
  
  if (process.env.NODE_ENV === "development") {
    origins.push("http://localhost:3000");
  }
  
  return origins;
};

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: getTrustedOrigins(),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      redirectURI: `${baseURL}/api/auth/callback/google`,
    },
  },
});

