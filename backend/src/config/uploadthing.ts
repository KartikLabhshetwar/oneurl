import "dotenv/config";
import { createUploadthing, type FileRouter } from "uploadthing/express";
import { UploadThingError } from "uploadthing/server";
import { auth } from "./auth";

if (!process.env.UPLOADTHING_TOKEN && !process.env.UPLOADTHING_SECRET) {
  console.warn("[UploadThing] Warning: UPLOADTHING_TOKEN or UPLOADTHING_SECRET not set. File uploads may fail.");
}

const f = createUploadthing();

export const ourFileRouter = {
  avatarUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      try {
        const session = await auth.api.getSession({ headers: req.headers as unknown as Headers });
        
        if (!session) {
          throw new UploadThingError("You must be logged in to upload files");
        }

        return { userId: session.user.id };
      } catch (error) {
        console.error("[UploadThing] Auth error in middleware:", error);
        throw new UploadThingError("Authentication failed");
      }
    })
    .onUploadComplete(async ({ file, metadata }) => {
      console.log("[UploadThing] Avatar uploaded:", file.name, "for user:", metadata?.userId);
      return { url: file.ufsUrl };
    }),
  linkPreviewImageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      try {
        const session = await auth.api.getSession({ headers: req.headers as unknown as Headers });
        
        if (!session) {
          throw new UploadThingError("You must be logged in to upload files");
        }

        return { userId: session.user.id };
      } catch (error) {
        console.error("[UploadThing] Auth error in middleware:", error);
        throw new UploadThingError("Authentication failed");
      }
    })
    .onUploadComplete(async ({ file, metadata }) => {
      console.log("[UploadThing] Link preview image uploaded:", file.name, "for user:", metadata?.userId);
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

