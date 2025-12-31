"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Link2,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Popover,
  PopoverTrigger,
  PopoverPopup,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { getAvatarUrl } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

interface DashboardSidebarProps {
  user: {
    name: string;
    username: string | null;
    avatarUrl: string | null;
    image: string | null;
  };
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const avatarUrl = getAvatarUrl(user);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const menuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Links",
      url: "/dashboard/links",
      icon: Link2,
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChart3,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/dashboard" className="flex h-16 items-center px-6 justify-center">
          <Image
            src="/logo.png"
            alt="OneURL"
            width={128}
            height={128}
            className="h-20 w-20"
          />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      isActive={isActive}
                      render={
                        <Link href={item.url} />
                      }
                    >
                      <Icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
          >
            {avatarUrl && (
              <Image
                src={avatarUrl}
                alt={user.name}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full"
              />
            )}
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium truncate">{user.name}</p>
              {user.username && (
                <p className="text-xs text-muted-foreground truncate">
                  @{user.username}
                </p>
              )}
            </div>
          </PopoverTrigger>
          <PopoverPopup>
            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={async () => {
                setIsPopoverOpen(false);
                try {
                  await authClient.signOut();
                  router.push("/");
                  router.refresh();
                } catch (error) {
                  console.error("Sign out error:", error);
                  router.push("/");
                  router.refresh();
                }
              }}
            >
              <LogOut />
              <span>Sign Out</span>
            </Button>
          </PopoverPopup>
        </Popover>
      </SidebarFooter>
    </Sidebar>
  );
}

