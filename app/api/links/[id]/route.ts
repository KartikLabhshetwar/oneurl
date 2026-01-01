import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { linkService } from "@/lib/services/link.service";
import { linkUpdateSchema } from "@/lib/validations/schemas";
import { db } from "@/lib/db";
import urlMetadata from "url-metadata";
import { fetchAndUploadLinkPreviewImage, deleteLinkPreviewImage } from "@/lib/utils/link-preview-image";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await req.json();

    const link = await db.link.findUnique({ where: { id } });
    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    const profile = await db.profile.findUnique({
      where: { id: link.profileId },
    });

    if (profile?.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = linkUpdateSchema.parse(body);
    
    if (data.url && data.url !== link.url && !link.icon) {
      const oldPreviewImageUrl = (link as { previewImageUrl?: string | null }).previewImageUrl;
      
      try {
        const metadata = await urlMetadata(data.url, {
          timeout: 10000,
          requestHeaders: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        });

        data.previewDescription = metadata["og:description"] || metadata.description || null;

        const imageUrl = metadata["og:image"] || metadata.image;
        if (imageUrl && typeof imageUrl === "string") {
          const newPreviewImageUrl = await fetchAndUploadLinkPreviewImage(imageUrl, link.id);
          if (newPreviewImageUrl) {
            data.previewImageUrl = newPreviewImageUrl;
            
            if (oldPreviewImageUrl) {
              await deleteLinkPreviewImage(oldPreviewImageUrl);
            }
          }
        } else if (oldPreviewImageUrl) {
          await deleteLinkPreviewImage(oldPreviewImageUrl);
          data.previewImageUrl = null;
          data.previewDescription = null;
        }
      } catch (error) {
        console.error("Failed to fetch and store preview data:", error);
      }
    }

    await linkService.update(id, data);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("redirect")) {
      throw error;
    }
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
    const session = await requireAuth();
    const { id } = await params;

    const link = await db.link.findUnique({ where: { id } });
    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    const profile = await db.profile.findUnique({
      where: { id: link.profileId },
    });

    if (profile?.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const previewImageUrl = (link as { previewImageUrl?: string | null }).previewImageUrl;
    if (previewImageUrl) {
      await deleteLinkPreviewImage(previewImageUrl);
    }

    await linkService.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("redirect")) {
      throw error;
    }
    return NextResponse.json(
      { error: "Failed to delete link" },
      { status: 500 }
    );
  }
}

