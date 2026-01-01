"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Form } from "@/components/ui/form";
import { Field, FieldLabel, FieldControl, FieldDescription } from "@/components/ui/field";
import { Fieldset } from "@/components/ui/fieldset";
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupInput } from "@/components/ui/input-group";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogClose,
} from "@/components/ui/alert-dialog";
import { useUpdateProfile, useUpdateAvatar, useDeleteAccount } from "@/lib/hooks/use-profile";
import { toastError, toastSuccess } from "@/lib/toast";
import { useUploadThing } from "@/lib/uploadthing-client";

export default function SettingsClient({
  initialProfile,
}: {
  initialProfile: { name: string; bio: string; username: string; avatarUrl: string | null; calLink: string };
}) {
  const [name, setName] = useState(initialProfile.name);
  const [bio, setBio] = useState(initialProfile.bio);
  const [username, setUsername] = useState(initialProfile.username);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialProfile.avatarUrl);
  const [calLink, setCalLink] = useState(initialProfile.calLink);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const updateProfile = useUpdateProfile();
  const updateAvatar = useUpdateAvatar();
  const deleteAccount = useDeleteAccount();

  const { startUpload, isUploading: isUploadThingUploading } = useUploadThing("avatarUploader", {
    onClientUploadComplete: async (res) => {
      if (res && res[0]?.url) {
        const newAvatarUrl = res[0].url;
        setAvatarUrl(newAvatarUrl);
        setIsUploading(false);
        try {
          await updateAvatar.mutateAsync(newAvatarUrl);
          toastSuccess("Avatar updated", "Your profile picture has been updated");
        } catch {
          setAvatarUrl(initialProfile.avatarUrl);
        }
      }
    },
    onUploadError: (error) => {
      setIsUploading(false);
      toastError("Upload failed", error.message || "Failed to upload image");
      setAvatarUrl(initialProfile.avatarUrl);
    },
    onUploadBegin: () => {
      setIsUploading(true);
    },
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      await startUpload([file]);
    },
    [startUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif"],
    },
    maxSize: 4 * 1024 * 1024,
    multiple: false,
    disabled: isUploading || isUploadThingUploading || updateAvatar.isPending,
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile.mutateAsync({ name, bio, username, calLink: calLink.trim() || null });
  };

  const handleDeleteAccount = async () => {
    await deleteAccount.mutateAsync();
  };

  return (
    <div className="p-8">
      <div className="mb-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your profile and account settings
        </p>
      </div>

      <div className="space-y-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent>
            <Form>
              <Field>
                <FieldLabel>Profile Picture</FieldLabel>
                <FieldDescription>
                  Upload an image file (max 4MB). This will be displayed on your profile page.
                </FieldDescription>
                <FieldControl
                  render={() => (
                    <div className="flex flex-col items-center gap-4">
                      <Avatar className="h-32 w-32 border-2 transition-all duration-200">
                        {avatarUrl && <AvatarImage src={avatarUrl} alt="Profile picture" />}
                        <AvatarFallback>
                          <svg
                            className="h-12 w-12 text-muted-foreground"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </AvatarFallback>
                      </Avatar>
                      <div {...getRootProps()} className="w-full">
                        <input {...getInputProps()} />
                        <Button
                          type="button"
                          disabled={isUploading || isUploadThingUploading || updateAvatar.isPending}
                          className="w-full"
                        >
                          {isUploading || isUploadThingUploading || updateAvatar.isPending
                            ? "Uploading..."
                            : isDragActive
                            ? "Drop image here"
                            : "Change Avatar"}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Image (4MB max)</p>
                    </div>
                  )}
                />
              </Field>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form onSubmit={handleSave}>
              <Fieldset>
                <Field>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <FieldDescription>
                    Your display name that will be shown on your profile
                  </FieldDescription>
                  <FieldControl
                    render={(props) => (
                      <Input
                        {...props}
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={updateProfile.isPending}
                      />
                    )}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="username">Username</FieldLabel>
                  <FieldDescription>
                    Your unique profile URL will be: oneurl.live/{username || "username"}
                  </FieldDescription>
                  <FieldControl
                    render={(props) => (
                      <InputGroup className="transition-all duration-200">
                        <InputGroupAddon align="inline-start">
                          <InputGroupText>oneurl.live/</InputGroupText>
                        </InputGroupAddon>
                        <InputGroupInput
                          {...props}
                          id="username"
                          value={username}
                          onChange={(e) => {
                            const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
                            setUsername(value);
                          }}
                          disabled={updateProfile.isPending}
                        />
                      </InputGroup>
                    )}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="bio">Bio</FieldLabel>
                  <FieldDescription>
                    A short description about yourself (optional)
                  </FieldDescription>
                  <FieldControl
                    render={(props) => (
                      <Textarea
                        {...props}
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        disabled={updateProfile.isPending}
                      />
                    )}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="calLink">Cal.com Link</FieldLabel>
                  <FieldDescription>
                    Add your Cal.com username or full URL to enable booking on your profile (optional)
                  </FieldDescription>
                  <FieldControl
                    render={(props) => (
                      <Input
                        {...props}
                        id="calLink"
                        value={calLink}
                        onChange={(e) => setCalLink(e.target.value)}
                        placeholder="username or https://cal.com/username"
                        disabled={updateProfile.isPending}
                      />
                    )}
                  />
                </Field>
                <Button type="submit" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </Fieldset>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive-outline"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleteAccount.isPending}
            >
              Remove Account
            </Button>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove your account? This action cannot be undone. All your data, links, and profile will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogClose>
              <Button variant="outline" disabled={deleteAccount.isPending}>
                Cancel
              </Button>
            </AlertDialogClose>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteAccount.isPending}
            >
              {deleteAccount.isPending ? "Removing..." : "Remove Account"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
