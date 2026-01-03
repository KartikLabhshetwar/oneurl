import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardMobileNav } from "@/components/dashboard-mobile-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <SidebarInset>
        <div className="pb-16 md:pb-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
