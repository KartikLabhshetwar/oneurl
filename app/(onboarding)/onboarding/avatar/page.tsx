import { requireAuth } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { getAvatarUrl } from "@/lib/utils";
import AvatarClient from "./avatar-client";

export default async function AvatarPage() {
  const session = await requireAuth();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  const googleImageUrl = getAvatarUrl(user || { image: null, avatarUrl: null });

  return <AvatarClient initialImageUrl={googleImageUrl} />;
}
