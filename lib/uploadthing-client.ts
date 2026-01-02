import { generateReactHelpers } from "@uploadthing/react";
import type { FileRouter as OurFileRouter } from "uploadthing/types";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export const { useUploadThing } = generateReactHelpers<OurFileRouter>({
  url: `${BACKEND_URL}/api/uploadthing`,
});

