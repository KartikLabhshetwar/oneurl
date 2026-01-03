import { NextResponse } from "next/server";
import { analyticsService } from "@/lib/services/analytics.service";
import { db } from "@/lib/db";

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
      return NextResponse.json({
        totalClicks: 0,
        topLinks: [],
        clicksOverTime: [],
      });
    }

    const linkId = searchParams.get("linkId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (linkId) {
      const link = await db.link.findFirst({
        where: { id: linkId, profileId: profile.id },
      });

      if (!link) {
        return NextResponse.json(
          { error: "Link not found" },
          { status: 404 }
        );
      }

      const stats = await analyticsService.getLinkStats(
        linkId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );

      return NextResponse.json(stats);
    }

    const stats = await analyticsService.getProfileStats(
      profile.id,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
