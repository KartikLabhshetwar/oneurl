import { NextResponse } from "next/server";
import { linkService } from "@/lib/services/link.service";
import { db } from "@/lib/db";
import { z } from "zod";

const reorderSchema = z.object({
  userId: z.string(),
  linkIds: z.array(z.string()),
});

export async function POST(req: Request) {
  try {
    const body = await reorderSchema.parse(await req.json());
    const { userId, linkIds } = body;

    const profile = await db.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const links = await db.link.findMany({
      where: { profileId: profile.id },
      select: { id: true },
    });

    const linkIdsSet = new Set(links.map((l) => l.id));
    const validLinkIds = linkIds.filter((id) => linkIdsSet.has(id));

    if (validLinkIds.length !== linkIds.length) {
      return NextResponse.json(
        { error: "Invalid link IDs provided" },
        { status: 400 }
      );
    }

    await linkService.reorder(profile.id, validLinkIds);

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
      { error: error instanceof Error ? error.message : "Failed to reorder links" },
      { status: 500 }
    );
  }
}
