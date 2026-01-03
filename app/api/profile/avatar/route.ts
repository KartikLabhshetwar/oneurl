import { NextResponse } from "next/server";
import { profileService } from "@/lib/services/profile.service";
import { db } from "@/lib/db";
import { getAvatarUrl } from "@/lib/utils";
import { deleteAvatarImage } from "@/lib/utils/link-preview-image";

export async function POST(req: Request) {
  try {
    const { userId, avatarUrl } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!avatarUrl) {
      return NextResponse.json(
        { error: "Avatar URL is required" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const oldAvatarUrl = user.avatarUrl;
    
    if (oldAvatarUrl && oldAvatarUrl !== avatarUrl) {
      await deleteAvatarImage(oldAvatarUrl);
    }

    await profileService.updateUserFields(userId, { avatarUrl });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update avatar" },
      { status: 500 }
    );
  }
}

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

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const avatarUrl = getAvatarUrl(user);

    if (!user.avatarUrl && user.image) {
      await profileService.updateUserFields(userId, {
        avatarUrl: user.image,
      });
      return NextResponse.json({ avatarUrl: user.image, synced: true });
    }

    return NextResponse.json({ avatarUrl });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch avatar" },
      { status: 500 }
    );
  }
}
