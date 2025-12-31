import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { profileService } from "@/lib/services/profile.service";
import { usernameSchema } from "@/lib/validations/schemas";

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || session.user.id;

    const profile = await profileService.getByUserId(userId);

    return NextResponse.json(profile);
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
    const { name, bio, username } = await req.json();

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

export async function DELETE(req: Request) {
  try {
    const session = await requireAuth();
    const { db } = await import("@/lib/db");

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
