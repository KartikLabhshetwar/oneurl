import { db } from "@/lib/db";
import { getAvatarUrl } from "@/lib/utils";
import AvatarClient from "./avatar-client";

export default async function AvatarPage() {
  return (
    <AvatarClient
      initialImageUrl={null}
      initialName=""
      initialBio=""
    />
  );
}
