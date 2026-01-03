import { BarChart3 } from "lucide-react";
import { analyticsService } from "@/lib/services/analytics.service";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { AnalyticsClient } from "./analytics-client";

export default async function AnalyticsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Analytics</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          Track your link performance
        </p>
      </div>
      <Card className="rounded-none">
        <CardContent className="p-6 sm:p-12">
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
