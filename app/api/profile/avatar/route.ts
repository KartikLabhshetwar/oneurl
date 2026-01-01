import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { profileService } from "@/lib/services/profile.service";
import { db } from "@/lib/db";
import { getAvatarUrl } from "@/lib/utils";
import { deleteAvatarImage } from "@/lib/utils/link-preview-image";

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const { avatarUrl } = await req.json();

    if (!avatarUrl) {
      return NextResponse.json(
        { error: "Avatar URL is required" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
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

    await profileService.updateUserFields(session.user.id, { avatarUrl });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("redirect")) {
      throw error;
    }
    return NextResponse.json(
      { error: "Failed to update avatar" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await requireAuth();
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const avatarUrl = getAvatarUrl(user);

    if (!user.avatarUrl && user.image) {
      await profileService.updateUserFields(session.user.id, {
        avatarUrl: user.image,
      });
      return NextResponse.json({ avatarUrl: user.image, synced: true });
    }

    return NextResponse.json({ avatarUrl });
  } catch (error) {
    if (error instanceof Error && error.message.includes("redirect")) {
      throw error;
    }
    return NextResponse.json(
      { error: "Failed to fetch avatar" },
      { status: 500 }
    );
  }
}

