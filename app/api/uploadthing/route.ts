import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

async function proxyToBackend(req: NextRequest) {
  const url = new URL(req.url);
  const backendUrl = `${BACKEND_URL}/api/uploadthing${url.search}`;
  
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  
  const headers = new Headers(req.headers);
  headers.delete("host");
  
  if (cookieHeader) {
    headers.set("cookie", cookieHeader);
  }
  
  const response = await fetch(backendUrl, {
    method: req.method,
    headers,
    body: req.method !== "GET" && req.method !== "HEAD" ? await req.arrayBuffer() : undefined,
  });

  const responseHeaders = new Headers(response.headers);
  
  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export async function GET(req: NextRequest) {
  return proxyToBackend(req);
}

export async function POST(req: NextRequest) {
  return proxyToBackend(req);
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

