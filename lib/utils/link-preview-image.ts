import { UTApi } from "uploadthing/server";
import { readFile } from "fs/promises";
import { join } from "path";

/**
 * Resolves a relative or absolute image URL to an absolute URL
 */
function resolveImageUrl(imageUrl: string, baseUrl: string): string {
  try {
    // If it's already an absolute URL, return it
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }

    // If it's a protocol-relative URL (starts with //), add https:
    if (imageUrl.startsWith("//")) {
      return `https:${imageUrl}`;
    }

    // Otherwise, resolve relative to base URL
    const baseUrlObj = new URL(baseUrl);
    if (imageUrl.startsWith("/")) {
      // Absolute path on same domain
      return `${baseUrlObj.protocol}//${baseUrlObj.host}${imageUrl}`;
    } else {
      // Relative path
      return new URL(imageUrl, baseUrl).toString();
    }
  } catch (error) {
    console.error("Failed to resolve image URL:", error);
    return imageUrl;
  }
}

export async function fetchAndUploadLinkPreviewImage(
  imageUrl: string,
  linkId: string,
  baseUrl?: string
): Promise<string | null> {
  try {
    // Resolve relative URLs to absolute URLs
    let absoluteImageUrl = imageUrl;
    if (baseUrl) {
      absoluteImageUrl = resolveImageUrl(imageUrl, baseUrl);
    } else if (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
      // If no base URL provided and it's relative, try to make it absolute
      if (imageUrl.startsWith("//")) {
        absoluteImageUrl = `https:${imageUrl}`;
      } else {
        console.warn(`[Link Preview] Relative image URL without base URL: ${imageUrl}`);
        return null;
      }
    }

    console.log(`[Link Preview] Fetching image from: ${absoluteImageUrl}`);

    const response = await fetch(absoluteImageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "image/*",
      },
      // Add redirect following
      redirect: "follow",
    });

    if (!response.ok) {
      console.error(`[Link Preview] Failed to fetch image: ${response.status} ${response.statusText}`);
      return null;
    }

    // Get content type from headers or infer from URL
    let contentType = response.headers.get("content-type");
    if (!contentType || !contentType.startsWith("image/")) {
      // Try to infer from URL extension
      const urlLower = absoluteImageUrl.toLowerCase();
      if (urlLower.endsWith(".jpg") || urlLower.endsWith(".jpeg")) {
        contentType = "image/jpeg";
      } else if (urlLower.endsWith(".png")) {
        contentType = "image/png";
      } else if (urlLower.endsWith(".gif")) {
        contentType = "image/gif";
      } else if (urlLower.endsWith(".webp")) {
        contentType = "image/webp";
      } else if (urlLower.endsWith(".svg")) {
        contentType = "image/svg+xml";
      } else {
        console.warn(`[Link Preview] Unknown content type for image: ${absoluteImageUrl}, content-type: ${contentType}`);
        // Still try to process it as image/jpeg as fallback
        contentType = "image/jpeg";
      }
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Check file size (4MB limit)
    if (buffer.length > 4 * 1024 * 1024) {
      console.error(`[Link Preview] Image too large: ${buffer.length} bytes`);
      return null;
    }

    const utapi = new UTApi();
    const extension = getImageExtension(contentType);
    const fileName = `link-preview-${linkId}-${Date.now()}.${extension}`;
    
    const file = new File([buffer], fileName, {
      type: contentType,
    });

    console.log(`[Link Preview] Uploading image: ${fileName}, size: ${buffer.length} bytes, type: ${contentType}`);

    const result = await utapi.uploadFiles([file]);

    if (!result || !Array.isArray(result) || result.length === 0) {
      console.error("[Link Preview] No result from uploadFiles");
      return null;
    }

    // uploadFiles returns UploadFileResult[] where UploadFileResult is Either<UploadedFileData, SerializedUploadThingError>
    // Either type: { data: TData, error: null } | { data: null, error: TError }
    const firstResult = result[0];
    
    if (!firstResult) {
      console.error("[Link Preview] Empty result from uploadFiles");
      return null;
    }

    // Check if it's an error case
    if (firstResult.error) {
      console.error("[Link Preview] UploadThing error:", firstResult.error);
      return null;
    }

    // Success case - data is UploadedFileData which has url and ufsUrl properties
    // Prioritize ufsUrl as url is deprecated
    const uploadedData = firstResult.data;
    if (!uploadedData) {
      console.error("[Link Preview] No data in upload result");
      return null;
    }

    const uploadedUrl = uploadedData.ufsUrl || uploadedData.url || null;
    console.log(`[Link Preview] Successfully uploaded image: ${uploadedUrl}`);
    return uploadedUrl;
  } catch (error) {
    console.error("[Link Preview] Failed to fetch and upload link preview image:", error);
    if (error instanceof Error) {
      console.error("[Link Preview] Error details:", error.message, error.stack);
    }
    return null;
  }
}

function getImageExtension(contentType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
  };
  return map[contentType] || "jpg";
}

export async function deleteLinkPreviewImage(imageUrl: string): Promise<void> {
  try {
    if (!imageUrl || (!imageUrl.includes("uploadthing.com") && !imageUrl.includes("ufs.sh") && !imageUrl.includes("utfs.io"))) {
      return;
    }

    const urlParts = imageUrl.split("/");
    const fileKey = urlParts[urlParts.length - 1];

    if (!fileKey) {
      return;
    }

    const utapi = new UTApi();
    await utapi.deleteFiles([fileKey]);
  } catch (error) {
    console.error("Failed to delete link preview image:", error);
  }
}

export async function deleteAvatarImage(imageUrl: string): Promise<void> {
  try {
    if (!imageUrl || (!imageUrl.includes("uploadthing.com") && !imageUrl.includes("ufs.sh") && !imageUrl.includes("utfs.io"))) {
      return;
    }

    const urlParts = imageUrl.split("/");
    const fileKey = urlParts[urlParts.length - 1];

    if (!fileKey) {
      return;
    }

    const utapi = new UTApi();
    await utapi.deleteFiles([fileKey]);
  } catch (error) {
    console.error("Failed to delete avatar image:", error);
  }
}

let fallbackImageUrl: string | null = null;

export async function getFallbackPreviewImage(): Promise<string | null> {
  if (fallbackImageUrl) {
    return fallbackImageUrl;
  }

  try {
    const publicPath = join(process.cwd(), "public", "og.png");
    const buffer = await readFile(publicPath);
    
    const utapi = new UTApi();
    const fileName = `link-preview-fallback-${Date.now()}.png`;
    
    const file = new File([buffer], fileName, {
      type: "image/png",
    });

    const result = await utapi.uploadFiles([file]);

    if (!result || !Array.isArray(result) || result.length === 0) {
      return null;
    }

    const firstResult = result[0];
    if (!firstResult || firstResult.error || !firstResult.data) {
      return null;
    }

    fallbackImageUrl = firstResult.data.ufsUrl || firstResult.data.url || null;
    return fallbackImageUrl;
  } catch (error) {
    console.error("[Link Preview] Failed to upload fallback image:", error);
    return null;
  }
}

