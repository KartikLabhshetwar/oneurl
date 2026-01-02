import { generateReactHelpers } from "@uploadthing/react";
import type { FileRouter as OurFileRouter } from "uploadthing/types";

export const { useUploadThing } = generateReactHelpers<OurFileRouter>({
  url: "/api/uploadthing",
});

