import { requireAuth } from "@/lib/auth-guard";
import SettingsClient from "./settings-client";
import { fetchFromBackendServer } from "@/lib/utils/server-api-client";

export default async function SettingsPage() {
  await requireAuth();
  
  let profileData = null;
  try {
    const res = await fetchFromBackendServer("/api/profile");
    if (res.ok) {
      profileData = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch profile:", error);
  }

  return (
    <SettingsClient
      initialProfile={{
        name: profileData?.name || "",
        bio: profileData?.bio || "",
        username: profileData?.username || "",
        avatarUrl: profileData?.avatarUrl || null,
        calLink: profileData?.profile?.calLink || "",
      }}
    />
  );
}
