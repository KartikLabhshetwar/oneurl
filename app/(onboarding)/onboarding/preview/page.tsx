import { profileService } from "@/lib/services/profile.service";
import PreviewClient from "./preview-client";
import { getAvatarUrl } from "@/lib/utils";
import { PreviewWrapper } from "./preview-wrapper";

export default async function PreviewPage() {
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
          initialName=""
          initialUsername={null}
          initialBio={null}
          initialAvatarUrl={null}
          initialTitle={null}
          initialCalLink={null}
        />
      </div>

      <PreviewClient />
    </div>
  );
}
