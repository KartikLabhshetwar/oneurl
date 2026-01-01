import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { profileService } from "@/lib/services/profile.service";

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || session.user.id;

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
    if (error instanceof Error && error.message.includes("redirect")) {
      throw error;
    }
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireAuth();
    const { name, bio, username, calLink } = await req.json();

    if (username) {
      await profileService.updateUsername(session.user.id, username);
    }

    if (bio !== undefined) {
      await profileService.updateUserFields(session.user.id, { bio });
    }

    if (name) {
      const { db } = await import("@/lib/db");
      await db.user.update({
        where: { id: session.user.id },
        data: { name },
      });
    }

    if (calLink !== undefined) {
      await profileService.updateProfile(session.user.id, { 
        calLink,
        theme: "default"
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("redirect")) {
      throw error;
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update profile" },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await requireAuth();
    const { db } = await import("@/lib/db");
    const { deleteAvatarImage } = await import("@/lib/utils/link-preview-image");

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.avatarUrl) {
      await deleteAvatarImage(user.avatarUrl);
    }

    await db.user.delete({
      where: { id: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes("redirect")) {
      throw error;
    }
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
