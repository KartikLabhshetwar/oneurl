"use client";

import { useState } from "react";
import type * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipTrigger,
  TooltipPopup,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { X, Globe, Monitor, Smartphone, Tablet, TrendingUp, Users, MousePointerClick, RefreshCw } from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#0088fe",
  "#ff6b9d",
  "#c44569",
];

const PRIMARY_CHART_COLOR = "#8884d8";

interface ProfileStats {
  totalClicks: number;
  uniqueVisitors?: number;
  topLinks: Array<{ link_id: string; clicks: number }>;
  clicksOverTime: Array<{ date: string; clicks: number }>;
  clicksByReferrer?: Array<{ referrer: string; clicks: number }>;
  clicksByUTMSource?: Array<{ source: string; clicks: number }>;
  clicksByUTMMedium?: Array<{ medium: string; clicks: number }>;
  clicksByUTMCampaign?: Array<{ campaign: string; clicks: number }>;
}

interface LinkStats {
  linkId: string;
  totalClicks: number;
  uniqueVisitors?: number;
  clicksOverTime: Array<{ date: string; clicks: number }>;
  clicksByCountry: Array<{ country: string; clicks: number }>;
  clicksByDevice: Array<{ device: string; clicks: number }>;
  clicksByBrowser: Array<{ browser: string; clicks: number }>;
  clicksByOS?: Array<{ os: string; clicks: number }>;
  clicksByReferrer?: Array<{ referrer: string; clicks: number }>;
  clicksByUTMSource?: Array<{ source: string; clicks: number }>;
  clicksByUTMMedium?: Array<{ medium: string; clicks: number }>;
  clicksByUTMCampaign?: Array<{ campaign: string; clicks: number }>;
}

interface Link {
  id: string;
  title: string;
  url: string;
  isActive?: boolean;
}

interface AnalyticsClientProps {
  initialStats: ProfileStats;
  links: Link[];
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

function getReferrerIcon(referrer: string) {
  const lower = referrer.toLowerCase();
  if (lower.includes("twitter") || lower.includes("x.com")) return "𝕏";
  if (lower.includes("linkedin")) return "in";
  if (lower.includes("facebook")) return "f";
  if (lower.includes("youtube")) return "▶";
  if (lower.includes("google")) return "G";
  if (lower.includes("bing")) return "Q";
  if (lower === "direct") return "→";
  return "🌐";
}

function getOSIcon(os: string) {
  const lower = os.toLowerCase();
  if (lower.includes("windows")) return "🪟";
  if (lower.includes("macos") || lower.includes("mac")) return "🍎";
  if (lower.includes("android")) return "🤖";
  if (lower.includes("ios")) return "📱";
  if (lower.includes("linux")) return "🐧";
  return "💻";
}

function getDeviceIcon(device: string) {
  const lower = device.toLowerCase();
  if (lower.includes("mobile")) return <Smartphone className="h-4 w-4" />;
  if (lower.includes("tablet")) return <Tablet className="h-4 w-4" />;
  return <Monitor className="h-4 w-4" />;
}

export function AnalyticsClient({
  initialStats,
  links,
}: AnalyticsClientProps) {
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [trafficSourceTab, setTrafficSourceTab] = useState("referrers");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const { data: stats = initialStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["analytics", selectedLinkId],
    queryFn: async () => {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
      const url = selectedLinkId
        ? `${BACKEND_URL}/api/analytics?linkId=${selectedLinkId}`
        : `${BACKEND_URL}/api/analytics`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
    initialData: selectedLinkId ? undefined : initialStats,
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
    gcTime: 60000,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["analytics", selectedLinkId] });
      await queryClient.invalidateQueries({ queryKey: ["link-click-counts"] });
      await queryClient.refetchQueries({ queryKey: ["analytics", selectedLinkId] });
      await queryClient.refetchQueries({ queryKey: ["link-click-counts"] });
    } catch (error) {
      console.error("Failed to refresh analytics:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const selectedLink = selectedLinkId
    ? links.find((l) => l.id === selectedLinkId)
    : null;

  const topLinksWithDetails = stats.topLinks
    ? stats.topLinks
        .map((item: { link_id: string; clicks: number }) => {
          const link = links.find((l) => l.id === item.link_id);
          return {
            ...item,
            title: link?.title || "Unknown",
            url: link?.url || "",
          };
        })
        .slice(0, 20)
    : [];

  const clicksOverTimeData = stats.clicksOverTime
    ? stats.clicksOverTime.map((item: { date: string; clicks: number }) => ({
        date: new Date(item.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        clicks: item.clicks,
      }))
    : [];

  const linkStats = stats as LinkStats;
  const profileStats = stats as ProfileStats;

  const totalClicks = stats.totalClicks || 0;
  const uniqueVisitors = stats.uniqueVisitors || 0;
  const avgClicksPerVisitor = uniqueVisitors > 0 ? (totalClicks / uniqueVisitors).toFixed(1) : "0";

  const referrerData = (selectedLinkId ? linkStats.clicksByReferrer : profileStats.clicksByReferrer) || [];
  const utmSourceData = (selectedLinkId ? linkStats.clicksByUTMSource : profileStats.clicksByUTMSource) || [];
  const utmMediumData = (selectedLinkId ? linkStats.clicksByUTMMedium : profileStats.clicksByUTMMedium) || [];
  const utmCampaignData = (selectedLinkId ? linkStats.clicksByUTMCampaign : profileStats.clicksByUTMCampaign) || [];

  const deviceData = linkStats.clicksByDevice
    ? linkStats.clicksByDevice.map((item) => ({
        name: item.device,
        value: item.clicks,
      }))
    : [];

  const browserData = linkStats.clicksByBrowser
    ? linkStats.clicksByBrowser.map((item) => ({
        name: item.browser,
        value: item.clicks,
      }))
    : [];

  const osData = linkStats.clicksByOS
    ? linkStats.clicksByOS.map((item) => ({
        name: item.os,
        value: item.clicks,
      }))
    : [];

  const countryData = linkStats.clicksByCountry
    ? linkStats.clicksByCountry.slice(0, 10).map((item) => ({
        name: item.country,
        value: item.clicks,
      }))
    : [];

  const totalForShare = (data: Array<{ clicks?: number; value?: number }>) => {
    return data.reduce((sum, item) => sum + (item.clicks || item.value || 0), 0) || 1;
  };

  const getShare = (clicks: number, total: number) => {
    return total > 0 ? ((clicks / total) * 100).toFixed(2) : "0";
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-end gap-2">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoadingStats || isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoadingStats || isRefreshing ? "animate-spin" : ""}`} />
                  Refresh
                </Button> as React.ReactElement
              }
            />
            <TooltipPopup>Refresh analytics data</TooltipPopup>
          </Tooltip>
        </div>

        {selectedLinkId && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Viewing analytics for
                  </p>
                  <p className="text-lg font-semibold">{selectedLink?.title}</p>
                  <p className="text-sm text-muted-foreground truncate max-w-md">
                    {selectedLink?.url}
                  </p>
                </div>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedLinkId(null)}
                      >
                        <X className="h-4 w-4" />
                        View All Links
                      </Button> as React.ReactElement
                    }
                  />
                  <TooltipPopup>View analytics for all links</TooltipPopup>
                </Tooltip>
              </div>
            </CardContent>
          </Card>
        )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MousePointerClick className="h-4 w-4" />
              Total Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatNumber(totalClicks)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Unique Visitors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatNumber(uniqueVisitors)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg. Clicks/Visitor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{avgClicksPerVisitor}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Active Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {links.filter((l) => l.isActive !== false).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Traffic Trends</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingStats ? (
            <Skeleton className="h-[400px] w-full" />
          ) : clicksOverTimeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={clicksOverTimeData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke={PRIMARY_CHART_COLOR}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <TrendingUp />
                </EmptyMedia>
                <EmptyTitle>No data yet</EmptyTitle>
                <EmptyDescription>
                  Click data will appear here as visitors interact with your
                  links.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={trafficSourceTab} onValueChange={setTrafficSourceTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="referrers">
                  Referrers ({referrerData.length})
                </TabsTrigger>
                <TabsTrigger value="utm-sources">
                  UTM Sources ({utmSourceData.length})
                </TabsTrigger>
                <TabsTrigger value="utm-mediums">
                  UTM Mediums ({utmMediumData.length})
                </TabsTrigger>
                <TabsTrigger value="utm-campaigns">
                  UTM Campaigns ({utmCampaignData.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="referrers" className="mt-4">
                {referrerData.length > 0 ? (
                  <div className="space-y-2">
                    {referrerData.map((item) => {
                      const total = totalForShare(referrerData);
                      const share = getShare(item.clicks, total);
                      return (
                        <div
                          key={item.referrer}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-lg">
                              {getReferrerIcon(item.referrer)}
                            </span>
                            <span className="text-sm font-medium truncate">
                              {item.referrer}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 ml-4">
                            <span className="text-sm text-muted-foreground">
                              {item.clicks}
                            </span>
                            <span className="text-sm font-medium w-16 text-right">
                              {share}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Globe />
                      </EmptyMedia>
                      <EmptyTitle>No referrer data</EmptyTitle>
                    </EmptyHeader>
                  </Empty>
                )}
              </TabsContent>

              <TabsContent value="utm-sources" className="mt-4">
                {utmSourceData.length > 0 ? (
                  <div className="space-y-2">
                    {utmSourceData.map((item) => {
                      const total = totalForShare(utmSourceData);
                      const share = getShare(item.clicks, total);
                      return (
                        <div
                          key={item.source}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                        >
                          <span className="text-sm font-medium truncate">
                            {item.source}
                          </span>
                          <div className="flex items-center gap-4 ml-4">
                            <span className="text-sm text-muted-foreground">
                              {item.clicks}
                            </span>
                            <span className="text-sm font-medium w-16 text-right">
                              {share}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Globe />
                      </EmptyMedia>
                      <EmptyTitle>No UTM source data</EmptyTitle>
                    </EmptyHeader>
                  </Empty>
                )}
              </TabsContent>

              <TabsContent value="utm-mediums" className="mt-4">
                {utmMediumData.length > 0 ? (
                  <div className="space-y-2">
                    {utmMediumData.map((item) => {
                      const total = totalForShare(utmMediumData);
                      const share = getShare(item.clicks, total);
                      return (
                        <div
                          key={item.medium}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                        >
                          <span className="text-sm font-medium truncate">
                            {item.medium}
                          </span>
                          <div className="flex items-center gap-4 ml-4">
                            <span className="text-sm text-muted-foreground">
                              {item.clicks}
                            </span>
                            <span className="text-sm font-medium w-16 text-right">
                              {share}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Globe />
                      </EmptyMedia>
                      <EmptyTitle>No UTM medium data</EmptyTitle>
                    </EmptyHeader>
                  </Empty>
                )}
              </TabsContent>

              <TabsContent value="utm-campaigns" className="mt-4">
                {utmCampaignData.length > 0 ? (
                  <div className="space-y-2">
                    {utmCampaignData.map((item) => {
                      const total = totalForShare(utmCampaignData);
                      const share = getShare(item.clicks, total);
                      return (
                        <div
                          key={item.campaign}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                        >
                          <span className="text-sm font-medium truncate">
                            {item.campaign}
                          </span>
                          <div className="flex items-center gap-4 ml-4">
                            <span className="text-sm text-muted-foreground">
                              {item.clicks}
                            </span>
                            <span className="text-sm font-medium w-16 text-right">
                              {share}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Globe />
                      </EmptyMedia>
                      <EmptyTitle>No UTM campaign data</EmptyTitle>
                    </EmptyHeader>
                  </Empty>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {!selectedLinkId && (
          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
            </CardHeader>
            <CardContent>
              {topLinksWithDetails.length > 0 ? (
                <div className="space-y-2">
                  {topLinksWithDetails.slice(0, 10).map((item: { link_id: string; title: string; url: string; clicks: number }) => {
                    const total = totalForShare(topLinksWithDetails);
                    const share = getShare(item.clicks, total);
                    return (
                      <div
                        key={item.link_id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedLinkId(item.link_id)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {item.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.url}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 ml-4">
                          <span className="text-sm text-muted-foreground">
                            {item.clicks}
                          </span>
                          <span className="text-sm font-medium w-16 text-right">
                            {share}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Globe />
                    </EmptyMedia>
                    <EmptyTitle>No data yet</EmptyTitle>
                  </EmptyHeader>
                </Empty>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {selectedLinkId && (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            {deviceData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Devices</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {deviceData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {deviceData.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(item.name)}
                          <span>{item.name}</span>
                        </div>
                        <span className="font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {browserData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Browsers</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={browserData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {browserData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {browserData.map((item) => {
                      const total = totalForShare(browserData);
                      const share = getShare(item.value, total);
                      return (
                        <div
                          key={item.name}
                          className="flex items-center justify-between text-sm"
                        >
                          <span>{item.name}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-muted-foreground">
                              {item.value}
                            </span>
                            <span className="font-medium w-16 text-right">
                              {share}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {osData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Operating Systems</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {osData.map((item) => {
                    const total = totalForShare(osData);
                    const share = getShare(item.value, total);
                    return (
                      <div
                        key={item.name}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {getOSIcon(item.name)}
                          </span>
                          <span className="text-sm font-medium">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            {item.value}
                          </span>
                          <span className="text-sm font-medium w-16 text-right">
                            {share}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {countryData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Countries</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={countryData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="name"
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill={PRIMARY_CHART_COLOR}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}
      </div>
    </TooltipProvider>
  );
}
