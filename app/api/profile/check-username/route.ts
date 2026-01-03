import { NextResponse } from "next/server";
import { profileService } from "@/lib/services/profile.service";

export async function POST(req: Request) {
  try {
    const { username, userId } = await req.json();

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const available = await profileService.checkUsernameAvailable(
      username,
      userId
    );

    return NextResponse.json({ available });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid username" },
      { status: 400 }
    );
  }
}
