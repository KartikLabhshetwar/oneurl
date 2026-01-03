import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { CallbackClient } from "./callback-client";

async function getSessionWithRetry(maxRetries = 5, delay = 300) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const session = await auth.api.getSession({ 
        headers: await headers() 
      });
      
      if (session) {
        return session;
      }
    } catch (error) {
      console.error("Session check error:", error);
    }
    
    if (i < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return null;
}

export default async function AuthCallbackPage() {
  const session = await getSessionWithRetry();

  if (!session) {
    return <CallbackClient redirectTo="/login" />;
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { isOnboarded: true },
  });

  if (user?.isOnboarded) {
    redirect("/dashboard");
  }

  redirect("/onboarding/username");
}

