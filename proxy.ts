import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const { pathname } = request.nextUrl;

  if (session && ["/login", "/signup"].includes(pathname)) {
    const { db } = await import("@/lib/db");
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { isOnboarded: true },
    });

    if (user?.isOnboarded) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/onboarding/username", request.url));
  }

  if (!session && (pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding"))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/login", "/signup"],
};

