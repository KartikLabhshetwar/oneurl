import { requireAuth } from "@/lib/auth-guard";
import { profileService } from "@/lib/services/profile.service";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await requireAuth();
  const profile = await profileService.getByUserId(session.user.id);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {session.user.name || "User"}!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>View your public profile</CardDescription>
          </CardHeader>
          <CardContent>
            {profile?.username ? (
              <Button render={<Link href={`/${profile.username}`} target="_blank" />}>
                View Profile
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Complete onboarding to view your profile
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Links</CardTitle>
            <CardDescription>
              {profile?.profile?.links?.length || 0} active links
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button render={<Link href="/dashboard/links" />} variant="outline">
              Manage Links
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>Track your link performance</CardDescription>
          </CardHeader>
          <CardContent>
            <Button render={<Link href="/dashboard/analytics" />} variant="outline">
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

