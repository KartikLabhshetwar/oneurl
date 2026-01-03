import { NextResponse } from "next/server";
import { profileService } from "@/lib/services/profile.service";

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

    const user = await profileService.getByUserId(userId);

    if (!user) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    const response = {
      name: user.name,
      bio: user.bio,
      username: user.username,
      avatarUrl: user.avatarUrl || user.image || null,
      profile: user.profile ? {
        title: user.profile.title,
        calLink: user.profile.calLink,
      } : null,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId, name, bio, username, calLink } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (username) {
      await profileService.updateUsername(userId, username);
    }

    if (bio !== undefined) {
      await profileService.updateUserFields(userId, { bio });
    }

    if (name) {
      const { db } = await import("@/lib/db");
      await db.user.update({
        where: { id: userId },
        data: { name },
      });
    }

    if (calLink !== undefined) {
      await profileService.updateProfile(userId, { 
        calLink,
        theme: "default"
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update profile" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const { db } = await import("@/lib/db");
    const { deleteAvatarImage } = await import("@/lib/utils/link-preview-image");

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (user?.avatarUrl) {
      await deleteAvatarImage(user.avatarUrl);
    }

    await db.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
