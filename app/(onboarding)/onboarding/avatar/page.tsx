import { requireAuth } from "@/lib/auth-guard";
import AvatarClient from "./avatar-client";
import { fetchFromBackendServer } from "@/lib/utils/server-api-client";

export default async function AvatarPage() {
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

  return (
    <AvatarClient
      initialImageUrl={profileData?.avatarUrl || session.user.image || null}
      initialName={profileData?.name || session.user.name || ""}
      initialBio={profileData?.bio || ""}
    />
  );
}
