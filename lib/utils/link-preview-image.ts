import { UTApi } from "uploadthing/server";

export async function fetchAndUploadLinkPreviewImage(
  imageUrl: string,
  linkId: string
): Promise<string | null> {
  try {
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.startsWith("image/")) {
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const utapi = new UTApi();
    const file = new File([buffer], `link-preview-${linkId}-${Date.now()}.${getImageExtension(contentType)}`, {
      type: contentType,
    });

    const result = await utapi.uploadFiles([file]);

    if (!result || !Array.isArray(result) || result.length === 0) {
      return null;
    }

    // uploadFiles returns UploadFileResult[] where UploadFileResult is Either<UploadedFileData, SerializedUploadThingError>
    // Either type: { data: TData, error: null } | { data: null, error: TError }
    const firstResult = result[0];
    
    if (!firstResult) {
      return null;
    }

    // Check if it's an error case
    if (firstResult.error) {
      console.error("UploadThing error:", firstResult.error);
      return null;
    }

    // Success case - data is UploadedFileData which has url and ufsUrl properties
    // Prioritize ufsUrl as url is deprecated
    const uploadedData = firstResult.data;
    if (!uploadedData) {
      console.error("No data in upload result");
      return null;
    }

    return uploadedData.ufsUrl || uploadedData.url || null;
  } catch (error) {
    console.error("Failed to fetch and upload link preview image:", error);
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

