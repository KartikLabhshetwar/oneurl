import { requireAuth } from "@/lib/auth-guard";
import PreviewClient from "./preview-client";
import { PreviewWrapper } from "./preview-wrapper";
import { fetchFromBackendServer } from "@/lib/utils/server-api-client";

export default async function PreviewPage() {
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

  if (!profileData) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-12">
        <p>Profile not found</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 px-4 py-12">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl md:text-3xl font-medium tracking-tight leading-tight">Preview your profile</h2>
        <p className="text-xs text-zinc-600">
          This is how your profile will look to visitors
        </p>
      </div>

      <div className="mx-auto w-full">
        <PreviewWrapper
          initialName={profileData.name}
          initialUsername={profileData.username}
          initialBio={profileData.bio || null}
          initialAvatarUrl={profileData.avatarUrl || null}
          initialTitle={profileData.profile?.title || null}
          initialCalLink={profileData.profile?.calLink || null}
        />
      </div>

      <PreviewClient />
    </div>
  );
}

