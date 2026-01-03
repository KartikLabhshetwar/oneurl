import { NextResponse } from "next/server";
import { profileService } from "@/lib/services/profile.service";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { profile: { include: { links: true } } },
    });

    if (!user?.username) {
      return NextResponse.json(
        { error: "Please complete username step first" },
        { status: 400 }
      );
    }

    if (!user.profile || user.profile.links.length === 0) {
      return NextResponse.json(
        { error: "Please add at least one link" },
        { status: 400 }
      );
    }

    await profileService.publishProfile(userId);
    await db.user.update({
      where: { id: userId },
      data: { isOnboarded: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to publish profile" },
      { status: 500 }
    );
  }
}
