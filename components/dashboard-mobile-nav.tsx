"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  MoreHorizontal,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverPopup,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DashboardMobileNavProps {
  user: {
    name: string;
    username: string | null;
  };
}

export function DashboardMobileNav({ user }: DashboardMobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const menuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
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

  const handleSignOut = async () => {
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
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden shadow-lg rounded-t-2xl">
      <div className="grid grid-cols-4 h-16">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.url;
          return (
            <Link
              key={item.url}
              href={item.url}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span className="text-[10px] font-medium leading-tight">{item.title}</span>
            </Link>
          );
        })}
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              isPopoverOpen
                ? "text-foreground"
                : "text-muted-foreground"
            }`}
          >
            <MoreHorizontal
              className={`h-5 w-5 ${
                isPopoverOpen
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
              strokeWidth={isPopoverOpen ? 2 : 1.5}
            />
            <span className="text-[10px] font-medium leading-tight">More</span>
          </PopoverTrigger>
          <PopoverPopup side="top" align="end" className="mb-2">
            <div className="p-2 space-y-1">
              <div className="px-3 py-2 text-sm">
                <p className="font-medium">{user.name}</p>
                {user.username && (
                  <p className="text-xs text-muted-foreground">
                    @{user.username}
                  </p>
                )}
              </div>
              <Button
                variant="destructive"
                className="w-full justify-start rounded-lg border border-red-200/50 shadow-sm hover:bg-red-600 hover:border-red-300/50 transition-colors"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </PopoverPopup>
        </Popover>
      </div>
    </nav>
  );
}

