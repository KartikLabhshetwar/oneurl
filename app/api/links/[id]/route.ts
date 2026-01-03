import { NextResponse } from "next/server";
import { linkService } from "@/lib/services/link.service";
import { linkUpdateSchema } from "@/lib/validations/schemas";
import { db } from "@/lib/db";
import { fetchMetadataFromBackend } from "@/lib/utils/backend-client";
import { fetchAndUploadLinkPreviewImage, deleteLinkPreviewImage, getFallbackPreviewImage } from "@/lib/utils/link-preview-image";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, ...body } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const link = await db.link.findUnique({ where: { id } });
    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    const profile = await db.profile.findUnique({
      where: { id: link.profileId },
    });

    if (profile?.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = linkUpdateSchema.parse(body);
    
    if (data.url && data.url !== link.url && !link.icon) {
      const oldPreviewImageUrl = (link as { previewImageUrl?: string | null }).previewImageUrl;
      
      try {
        const metadata = await fetchMetadataFromBackend(data.url);

        data.previewDescription = metadata.description;

        const imageUrl = metadata.image;
        if (imageUrl && typeof imageUrl === "string") {
          const newPreviewImageUrl = await fetchAndUploadLinkPreviewImage(imageUrl, link.id, data.url);
          if (newPreviewImageUrl) {
            data.previewImageUrl = newPreviewImageUrl;
            
            if (oldPreviewImageUrl) {
              await deleteLinkPreviewImage(oldPreviewImageUrl);
            }
          } else {
            const fallback = await getFallbackPreviewImage();
            data.previewImageUrl = fallback;
            if (oldPreviewImageUrl) {
              await deleteLinkPreviewImage(oldPreviewImageUrl);
            }
          }
        } else {
          const fallback = await getFallbackPreviewImage();
          data.previewImageUrl = fallback;
          if (oldPreviewImageUrl) {
            await deleteLinkPreviewImage(oldPreviewImageUrl);
          }
        }
      } catch (error) {
        console.error("Failed to fetch and store preview data:", error);
        try {
          const fallback = await getFallbackPreviewImage();
          if (fallback) {
            data.previewImageUrl = fallback;
          }
        } catch (fallbackError) {
          console.error("Failed to set fallback image:", fallbackError);
        }
      }
    }

    await linkService.update(id, data);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error && typeof error === "object" && "issues" in error) {
      const zodError = error as { issues: Array<{ path: string[]; message: string }> };
      const firstError = zodError.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Validation failed" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update link" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const link = await db.link.findUnique({ where: { id } });
    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    const profile = await db.profile.findUnique({
      where: { id: link.profileId },
    });

    if (profile?.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const previewImageUrl = (link as { previewImageUrl?: string | null }).previewImageUrl;
    if (previewImageUrl) {
      await deleteLinkPreviewImage(previewImageUrl);
    }

    await linkService.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete link" },
      { status: 500 }
    );
  }
}
