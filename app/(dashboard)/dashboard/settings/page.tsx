import { profileService } from "@/lib/services/profile.service";
import { getAvatarUrl } from "@/lib/utils";
import SettingsClient from "./settings-client";

export default async function SettingsPage() {
  return (
    <SettingsClient
      initialProfile={{
        name: "",
        bio: "",
        username: "",
        avatarUrl: null,
        calLink: "",
      }}
    />
  );
}
