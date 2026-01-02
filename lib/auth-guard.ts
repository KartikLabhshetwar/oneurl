import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export async function requireAuth() {
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
      redirect("/login");
    }
    
    const session = await res.json();
    
    if (!session || !session.user) {
      redirect("/login");
    }
    
    return session;
  } catch (error) {
    console.error("Auth check failed:", error);
    redirect("/login");
  }
}

