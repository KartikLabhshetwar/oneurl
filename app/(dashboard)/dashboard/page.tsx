import { profileService } from "@/lib/services/profile.service";
import { db } from "@/lib/db";
import { getAvatarUrl } from "@/lib/utils";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  return (
    <DashboardClient
      initialProfile={{
        name: "User",
        username: null,
        bio: null,
        avatarUrl: null,
      }}
    />
  );
}
