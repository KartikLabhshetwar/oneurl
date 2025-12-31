import { requireAuth } from "@/lib/auth-guard";
import { profileService } from "@/lib/services/profile.service";
import { getAvatarUrl } from "@/lib/utils";
import SettingsClient from "./settings-client";

export default async function SettingsPage() {
  const session = await requireAuth();
  const profile = await profileService.getByUserId(session.user.id);

  return (
    <SettingsClient
      initialProfile={{
        name: profile?.name || "",
        bio: profile?.bio || "",
        username: profile?.username || "",
        avatarUrl: getAvatarUrl(profile || { image: null, avatarUrl: null }),
      }}
    />
  );
}

