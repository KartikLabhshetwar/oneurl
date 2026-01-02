import { BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { AnalyticsClient } from "./analytics-client";
import { fetchFromBackendServer } from "@/lib/utils/server-api-client";

export default async function AnalyticsPage() {
  let stats = null;
  let links: Array<{ id: string; title: string; url: string; isActive: boolean }> = [];
  let hasError = false;

  try {
    const [analyticsRes, linksRes] = await Promise.all([
      fetchFromBackendServer("/api/analytics"),
      fetchFromBackendServer("/api/links"),
    ]);

    if (analyticsRes.ok) {
      stats = await analyticsRes.json();
    } else if (analyticsRes.status === 401) {
      hasError = true;
    }

    if (linksRes.ok) {
      const linksData = await linksRes.json();
      links = (linksData.links || []).map((link: any) => ({
        id: link.id,
        title: link.title,
        url: link.url,
        isActive: link.isActive,
      }));
    }
  } catch (error) {
    console.error("Failed to fetch analytics data:", error);
    hasError = true;
  }

  if (hasError || !stats) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Track your link performance
          </p>
        </div>
        <Card>
          <CardContent className="p-12">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BarChart3 />
                </EmptyMedia>
                <EmptyTitle>No profile found</EmptyTitle>
                <EmptyDescription>
                  Create a profile to start tracking analytics.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track your link performance and understand your audience
        </p>
      </div>

      <AnalyticsClient
        initialStats={stats}
        links={links}
      />
    </div>
  );
}

