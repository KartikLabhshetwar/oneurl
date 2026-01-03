import { NextResponse } from "next/server";
import { profileService } from "@/lib/services/profile.service";

export async function POST(req: Request) {
  try {
    const { userId, username } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    await profileService.updateUsername(userId, username);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to set username" },
      { status: 400 }
    );
  }
}
