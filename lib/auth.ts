import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export async function getSession() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/get-session`, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });
    
    if (!res.ok) {
      return null;
    }
    
    const session = await res.json();
    
    if (!session || !session.user) {
      return null;
    }
    
    return session;
  } catch {
    return null;
  }
}

export async function getUserOnboardingStatus(userId: string): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  
  try {
    const res = await fetch(`${BACKEND_URL}/api/profile?userId=${userId}`, {
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });
    
    if (!res.ok) {
      return false;
    }
    
    const profile = await res.json();
    return !!profile?.username;
  } catch {
    return false;
  }
}

export async function getSessionWithOnboardingStatus() {
  const session = await getSession();
  
  if (!session) {
    return { session: null, isOnboarded: false };
  }
  
  const isOnboarded = await getUserOnboardingStatus(session.user.id);
  
  return { session, isOnboarded };
}
