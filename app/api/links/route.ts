import { NextResponse } from "next/server";
import { linkService } from "@/lib/services/link.service";
import { db } from "@/lib/db";
import { linkSchema } from "@/lib/validations/schemas";
import { fetchMetadataFromBackend } from "@/lib/utils/backend-client";
import { fetchAndUploadLinkPreviewImage, getFallbackPreviewImage } from "@/lib/utils/link-preview-image";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const profile = await db.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json({ links: [] });
    }

    const links = await linkService.getByProfileId(profile.id);

    return NextResponse.json({ links });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch links" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId, ...body } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    let profile = await db.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await db.profile.create({
        data: { userId },
      });
    }

    if (body.links && Array.isArray(body.links)) {
      await db.link.deleteMany({
        where: { profileId: profile.id },
      });

      const createdLinks = await Promise.all(
        body.links.map(
          async (
            link: { title: string; url: string; icon?: string },
            index: number
          ) => {
            const created = await linkService.create(profile.id, {
              title: link.title,
              url: link.url,
              icon: link.icon,
            });

            if (!link.icon) {
              (async () => {
                try {
                  const metadata = await fetchMetadataFromBackend(link.url);

                  const previewDescription = metadata.description;

                  const imageUrl = metadata.image;
                  let previewImageUrl: string | null = null;
                  
                  if (imageUrl && typeof imageUrl === "string") {
                    console.log(`[Link Preview] Found image for ${link.url}: ${imageUrl}`);
                    previewImageUrl = await fetchAndUploadLinkPreviewImage(imageUrl, created.id, link.url);
                    console.log(`[Link Preview] Uploaded image URL: ${previewImageUrl}`);
                  } else {
                    console.log(`[Link Preview] No image found for ${link.url}`);
                  }

                  if (!previewImageUrl) {
                    previewImageUrl = await getFallbackPreviewImage();
                    console.log(`[Link Preview] Using fallback image: ${previewImageUrl}`);
                  }

                  await db.link.update({
                    where: { id: created.id },
                    data: { 
                      previewImageUrl,
                      previewDescription,
                    },
                  });
                  console.log(`[Link Preview] Updated link ${created.id} with preview data`);
                } catch (error) {
                  console.error("[Link Preview] Failed to fetch and store preview data:", error);
                  try {
                    const fallback = await getFallbackPreviewImage();
                    if (fallback) {
                      await db.link.update({
                        where: { id: created.id },
                        data: { previewImageUrl: fallback },
                      });
                      console.log(`[Link Preview] Updated link ${created.id} with fallback image`);
                    }
                  } catch (fallbackError) {
                    console.error("[Link Preview] Failed to set fallback image:", fallbackError);
                  }
                }
              })();
            }

            return db.link.update({
              where: { id: created.id },
              data: { position: index },
            });
          }
        )
      );

      return NextResponse.json({ links: createdLinks });
    }

    const validated = linkSchema.parse(body);
    const link = await linkService.create(profile.id, validated);

    if (!validated.icon) {
      (async () => {
        try {
          const metadata = await fetchMetadataFromBackend(validated.url);

          const previewDescription = metadata.description;

          const imageUrl = metadata.image;
          let previewImageUrl: string | null = null;
          
          if (imageUrl && typeof imageUrl === "string") {
            console.log(`[Link Preview] Found image for ${validated.url}: ${imageUrl}`);
            previewImageUrl = await fetchAndUploadLinkPreviewImage(imageUrl, link.id, validated.url);
            console.log(`[Link Preview] Uploaded image URL: ${previewImageUrl}`);
          } else {
            console.log(`[Link Preview] No image found for ${validated.url}`);
          }

          if (!previewImageUrl) {
            previewImageUrl = await getFallbackPreviewImage();
            console.log(`[Link Preview] Using fallback image: ${previewImageUrl}`);
          }

          await db.link.update({
            where: { id: link.id },
            data: { 
              previewImageUrl,
              previewDescription,
            },
          });
          console.log(`[Link Preview] Updated link ${link.id} with preview data`);
        } catch (error) {
          console.error("[Link Preview] Failed to fetch and store preview data:", error);
          try {
            const fallback = await getFallbackPreviewImage();
            if (fallback) {
              await db.link.update({
                where: { id: link.id },
                data: { previewImageUrl: fallback },
              });
              console.log(`[Link Preview] Updated link ${link.id} with fallback image`);
            }
          } catch (fallbackError) {
            console.error("[Link Preview] Failed to set fallback image:", fallbackError);
          }
        }
      })();
    }

    return NextResponse.json({ link });
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
      { error: error instanceof Error ? error.message : "Failed to create link" },
      { status: 500 }
    );
  }
}
