import { requireAuth } from "@/lib/auth-guard";
import { redirect } from "next/navigation";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { DashboardSidebar } from "./dashboard-sidebar";
import { fetchFromBackendServer } from "@/lib/utils/server-api-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  let user = null;
  try {
    const res = await fetchFromBackendServer("/api/profile");
    if (res.ok) {
      user = await res.json();
    }
  } catch (error) {
    console.error("Failed to fetch user:", error);
  }

  if (!session.user) {
    redirect("/onboarding/username");
  }

  return (
    <SidebarProvider>
      <DashboardSidebar
        user={{
          name: user?.name || session.user.name,
          username: user?.username,
          avatarUrl: user?.avatarUrl,
          image: session.user.image,
        }}
      />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}

