import { Router, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { validateBody, validateParams } from "../middleware/validator";
import { profileService } from "../services/profile.service";
import { db } from "../config/db";
import {
  profileUpdateSchema,
  avatarSchema,
  usernameBodySchema,
  usernameParamSchema,
} from "../utils/validations";
import { AuthenticatedRequest } from "../types/express";

const router = Router();

router.get("/", requireAuth, async (req, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = (req.query.userId as string) || authReq.session!.user.id;

    const user = await profileService.getByUserId(userId);

    if (!user) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({
      name: user.name,
      bio: user.bio,
      username: user.username,
      avatarUrl: user.avatarUrl || user.image || null,
      profile: user.profile ? {
        title: user.profile.title,
        calLink: user.profile.calLink,
      } : null,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

router.patch("/", requireAuth, validateBody(profileUpdateSchema), async (req, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { name, bio, username, calLink } = req.body;

    if (username) {
      await profileService.updateUsername(authReq.session!.user.id, username);
    }

    if (bio !== undefined) {
      await profileService.updateUserFields(authReq.session!.user.id, { bio });
    }

    if (name) {
      await db.user.update({
        where: { id: authReq.session!.user.id },
        data: { name },
      });
    }

    if (calLink !== undefined) {
      await profileService.updateProfile(authReq.session!.user.id, { 
        calLink,
        theme: "default"
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(400).json({ error: error instanceof Error ? error.message : "Failed to update profile" });
  }
});

router.delete("/", requireAuth, async (req, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { UTApi } = await import("uploadthing/server");

    const user = await db.user.findUnique({
      where: { id: authReq.session!.user.id },
    });

    if (user?.avatarUrl) {
      try {
        const utapi = new UTApi();
        const urlParts = user.avatarUrl.split("/");
        const fileKey = urlParts[urlParts.length - 1];
        if (fileKey) {
          await utapi.deleteFiles([fileKey]);
        }
      } catch (deleteError) {
        console.error("Failed to delete avatar:", deleteError);
      }
    }

    await db.user.delete({
      where: { id: authReq.session!.user.id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

router.post("/avatar", requireAuth, validateBody(avatarSchema), async (req, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { avatarUrl } = req.body;

    const user = await db.user.findUnique({
      where: { id: authReq.session!.user.id },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const oldAvatarUrl = user.avatarUrl;
    
    if (oldAvatarUrl && oldAvatarUrl !== avatarUrl) {
      try {
        const { UTApi } = await import("uploadthing/server");
        const utapi = new UTApi();
        const urlParts = oldAvatarUrl.split("/");
        const fileKey = urlParts[urlParts.length - 1];
        if (fileKey) {
          await utapi.deleteFiles([fileKey]);
        }
      } catch (deleteError) {
        console.error("Failed to delete old avatar:", deleteError);
      }
    }

    await profileService.updateUserFields(authReq.session!.user.id, { avatarUrl });
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating avatar:", error);
    res.status(500).json({ error: "Failed to update avatar" });
  }
});

router.post("/username", requireAuth, validateBody(usernameBodySchema), async (req, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { username } = req.body;

    await profileService.updateUsername(authReq.session!.user.id, username);
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating username:", error);
    res.status(400).json({ error: error instanceof Error ? error.message : "Failed to set username" });
  }
});

router.post("/check-username", validateBody(usernameBodySchema), async (req, res: Response) => {
  try {
    const { auth } = await import("../config/auth");
    const session = await auth.api.getSession({ headers: req.headers as unknown as Headers });
    const { username } = req.body;

    const available = await profileService.checkUsernameAvailable(
      username,
      session?.user?.id
    );

    res.json({ available });
  } catch (error) {
    console.error("Error checking username:", error);
    res.status(400).json({ error: error instanceof Error ? error.message : "Invalid username" });
  }
});

router.post("/publish", requireAuth, async (req, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;

    const user = await db.user.findUnique({
      where: { id: authReq.session!.user.id },
      include: { profile: { include: { links: true } } },
    });

    if (!user?.username) {
      return res.status(400).json({ error: "Please complete username step first" });
    }

    if (!user.profile || user.profile.links.length === 0) {
      return res.status(400).json({ error: "Please add at least one link" });
    }

    await profileService.publishProfile(authReq.session!.user.id);
    await db.user.update({
      where: { id: authReq.session!.user.id },
      data: { isOnboarded: true },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error publishing profile:", error);
    res.status(500).json({ error: "Failed to publish profile" });
  }
});

router.get("/username/:username", validateParams(usernameParamSchema), async (req, res: Response) => {
  try {
    const { username } = req.params;
    const user = await profileService.getByUsername(username);

    if (!user) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const isDevelopment = process.env.NODE_ENV !== "production";
    const isPublished = user.profile?.isPublished === true;

    if (!isPublished && !isDevelopment) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({
      id: user.id,
      name: user.name,
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatarUrl || user.image || null,
      profile: {
        title: user.profile?.title || null,
        calLink: user.profile?.calLink || null,
        links: user.profile?.links || [],
        isPublished: isPublished,
      },
    });
  } catch (error) {
    console.error("Error fetching public profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

export default router;
