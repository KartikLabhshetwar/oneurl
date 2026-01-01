import { NextResponse } from "next/server";
import urlMetadata from "url-metadata";
import { getFallbackPreviewImage } from "@/lib/utils/link-preview-image";

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

    const metadata = await urlMetadata(validUrl, {
      timeout: 10000,
      requestHeaders: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    let favicon: string | null = null;
    if (metadata.favicons && Array.isArray(metadata.favicons) && metadata.favicons.length > 0) {
      const firstFavicon = metadata.favicons[0];
      if (typeof firstFavicon === "string") {
        favicon = firstFavicon;
      } else if (firstFavicon && typeof firstFavicon === "object" && "href" in firstFavicon) {
        favicon = firstFavicon.href as string;
      }
    }

    let image = metadata["og:image"] || metadata.image || null;
    if (!image) {
      const fallback = await getFallbackPreviewImage();
      image = fallback;
    }

    return NextResponse.json({
      title: metadata["og:title"] || metadata.title || null,
      description: metadata["og:description"] || metadata.description || null,
      image,
      logo: metadata["og:logo"] || metadata.logo || favicon || null,
      url: validUrl,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("timeout")) {
      const fallback = await getFallbackPreviewImage();
      return NextResponse.json({
        title: null,
        description: null,
        image: fallback,
        logo: null,
        url: validUrl,
      });
    }

    console.error("Error fetching link preview:", error);
    const fallback = await getFallbackPreviewImage();
    return NextResponse.json({
      title: null,
      description: null,
      image: fallback,
      logo: null,
      url: validUrl,
    });
  }
}

