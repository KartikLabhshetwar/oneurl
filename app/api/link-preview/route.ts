import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  let validUrl: string;
  try {
    const urlObj = new URL(url);
    validUrl = urlObj.toString();
  } catch {
    try {
      validUrl = new URL(`https://${url}`).toString();
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }
  }

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/preview?url=${encodeURIComponent(validUrl)}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 0 },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 403 || response.status === 408 || response.status === 404) {
        return NextResponse.json({
          title: null,
          description: null,
          image: null,
          logo: null,
          url: validUrl,
        });
      }

      throw new Error(errorData.error || `Backend returned ${response.status}`);
    }

    const result = await response.json();
    const metadata = result.data;

    return NextResponse.json({
      title: metadata.title,
      description: metadata.description,
      image: metadata.image || null,
      logo: metadata.logo,
      url: metadata.url,
    });
  } catch (error) {
    console.error("Error fetching link preview:", error);
    return NextResponse.json({
      title: null,
      description: null,
      image: null,
      logo: null,
      url: validUrl,
    });
  }
}

