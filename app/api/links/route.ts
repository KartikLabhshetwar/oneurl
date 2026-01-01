import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { linkService } from "@/lib/services/link.service";
import { db } from "@/lib/db";
import { linkSchema } from "@/lib/validations/schemas";
import urlMetadata from "url-metadata";
import { fetchAndUploadLinkPreviewImage } from "@/lib/utils/link-preview-image";

export async function GET() {
  try {
    const session = await requireAuth();
    const profile = await db.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ links: [] });
    }

    const links = await linkService.getByProfileId(profile.id);

    return NextResponse.json({ links });
  } catch (error) {
    if (error instanceof Error && error.message.includes("redirect")) {
      throw error;
    }
    return NextResponse.json(
      { error: "Failed to fetch links" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const body = await req.json();

    let profile = await db.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      profile = await db.profile.create({
        data: { userId: session.user.id },
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

            // Process preview in background for faster response
            if (!link.icon) {
              (async () => {
                try {
                  const metadata = await urlMetadata(link.url, {
                    timeout: 10000,
                    requestHeaders: {
                      "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                    },
                  });

                  const previewDescription = metadata["og:description"] || metadata.description || null;

                  const imageUrl = metadata["og:image"] || metadata.image;
                  let previewImageUrl: string | null = null;
                  
                  if (imageUrl && typeof imageUrl === "string") {
                    console.log(`[Link Preview] Fetching image for ${link.url}: ${imageUrl}`);
                    previewImageUrl = await fetchAndUploadLinkPreviewImage(imageUrl, created.id);
                    console.log(`[Link Preview] Uploaded image URL: ${previewImageUrl}`);
                  } else {
                    console.log(`[Link Preview] No image found for ${link.url}`);
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

    // Return link immediately, process preview in background
    if (!validated.icon) {
      // Don't await - process in background
      (async () => {
        try {
          const metadata = await urlMetadata(validated.url, {
            timeout: 10000,
            requestHeaders: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
          });

          const previewDescription = metadata["og:description"] || metadata.description || null;

          const imageUrl = metadata["og:image"] || metadata.image;
          let previewImageUrl: string | null = null;
          
          if (imageUrl && typeof imageUrl === "string") {
            console.log(`[Link Preview] Fetching image for ${validated.url}: ${imageUrl}`);
            previewImageUrl = await fetchAndUploadLinkPreviewImage(imageUrl, link.id);
            console.log(`[Link Preview] Uploaded image URL: ${previewImageUrl}`);
          } else {
            console.log(`[Link Preview] No image found for ${validated.url}`);
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
        }
      })();
    }

    return NextResponse.json({ link });
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
      { error: error instanceof Error ? error.message : "Failed to create link" },
      { status: 500 }
    );
  }
}
