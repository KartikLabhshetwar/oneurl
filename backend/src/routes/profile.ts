import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { profileService } from "../services/profile.service";
import { db } from "../config/db";
import { z } from "zod";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const session = (req as any).session;
    const userId = (req.query.userId as string) || session.user.id;

    const user = await profileService.getByUserId(userId);

    if (!user) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const response = {
      name: user.name,
      bio: user.bio,
      username: user.username,
      avatarUrl: user.avatarUrl || user.image || null,
      profile: user.profile ? {
        title: user.profile.title,
        calLink: user.profile.calLink,
      } : null,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

router.patch("/", requireAuth, async (req, res) => {
  try {
    const session = (req as any).session;
    const { name, bio, username, calLink } = req.body;

    if (username) {
      await profileService.updateUsername(session.user.id, username);
    }

    if (bio !== undefined) {
      await profileService.updateUserFields(session.user.id, { bio });
    }

    if (name) {
      await db.user.update({
        where: { id: session.user.id },
        data: { name },
      });
    }

    if (calLink !== undefined) {
      await profileService.updateProfile(session.user.id, { 
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

router.delete("/", requireAuth, async (req, res) => {
  try {
    const session = (req as any).session;
    const { UTApi } = await import("uploadthing/server");

    const user = await db.user.findUnique({
      where: { id: session.user.id },
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
      where: { id: session.user.id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

router.post("/avatar", requireAuth, async (req, res) => {
  try {
    const session = (req as any).session;
    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({ error: "Avatar URL is required" });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
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

    await profileService.updateUserFields(session.user.id, { avatarUrl });
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating avatar:", error);
    res.status(500).json({ error: "Failed to update avatar" });
  }
});

router.post("/username", requireAuth, async (req, res) => {
  try {
    const session = (req as any).session;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    await profileService.updateUsername(session.user.id, username);
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating username:", error);
    res.status(400).json({ error: error instanceof Error ? error.message : "Failed to set username" });
  }
});

router.post("/check-username", async (req, res) => {
  try {
    const { auth } = await import("../config/auth");
    const session = await auth.api.getSession({ headers: req.headers as HeadersInit });
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

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

router.post("/publish", requireAuth, async (req, res) => {
  try {
    const session = (req as any).session;

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { profile: { include: { links: true } } },
    });

    if (!user?.username) {
      return res.status(400).json({ error: "Please complete username step first" });
    }

    if (!user.profile || user.profile.links.length === 0) {
      return res.status(400).json({ error: "Please add at least one link" });
    }

    await profileService.publishProfile(session.user.id);
    await db.user.update({
      where: { id: session.user.id },
      data: { isOnboarded: true },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error publishing profile:", error);
    res.status(500).json({ error: "Failed to publish profile" });
  }
});

router.get("/username/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await profileService.getByUsername(username);

    if (!user || !user.profile?.isPublished) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({
      id: user.id,
      name: user.name,
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatarUrl || user.image || null,
      profile: {
        title: user.profile.title,
        calLink: user.profile.calLink,
        links: user.profile.links,
      },
    });
  } catch (error) {
    console.error("Error fetching public profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

export default router;

