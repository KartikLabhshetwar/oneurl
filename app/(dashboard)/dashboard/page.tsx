import { requireAuth } from "@/lib/auth-guard";
import { getAvatarUrl } from "@/lib/utils";
import { DashboardClient } from "./dashboard-client";
import { fetchFromBackendServer } from "@/lib/utils/server-api-client";

export default async function DashboardPage() {
  const session = await requireAuth();
  
  let profileData = null;
  try {
    const res = await fetchFromBackendServer("/api/profile");
    if (res.ok) {
      profileData = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch profile:", error);
  }

  const avatarUrl = profileData?.avatarUrl || session.user.image || null;

  return (
    <DashboardClient
      initialProfile={{
        name: profileData?.name || session.user.name || "User",
        username: profileData?.username || null,
        bio: profileData?.bio || null,
        avatarUrl,
      }}
    />
  );
}

