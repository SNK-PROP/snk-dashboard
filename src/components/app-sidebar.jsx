"use client";

import * as React from "react";
import {
  IconDashboard,
  IconSettings,
  IconUsers,
  IconHome,
  IconUserCheck,
  IconChartBar,
  IconBuildingStore,
  IconBriefcase,
  IconGift
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";

const staticData = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Users",
      url: "/users",
      icon: IconUsers,
    },
    {
      title: "Properties",
      url: "/properties",
      icon: IconHome,
    },
    {
      title: "Brokers",
      url: "/brokers",
      icon: IconUserCheck,
    },
    {
      title: "Employees",
      url: "/employees",
      icon: IconBriefcase,
    },
    {
      title: "Referrals",
      url: "/referrals",
      icon: IconGift,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: IconChartBar,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
  ],
};

export function AppSidebar({ ...props }) {
  const [user, setUser] = React.useState({
    name: "User",
    email: "email@example.com",
    avatar: "/brand_logo.jpeg",
  });

  const router = useRouter();

  React.useEffect(() => {
    const storedName = localStorage.getItem("userName");
    const storedEmail = localStorage.getItem("userEmail");

    setUser({
      name: storedName || "User",
      email: storedEmail || "email@example.com",
      avatar: "/brand_logo.jpeg",
    });
  }, []);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b border-gray-200 dark:border-zinc-800 py-2 flex items-center w-full overflow-hidden">
        <div className="flex items-center gap-3">
          <img
            src="/brand_logo.jpeg"
            alt="Logo"
            className="h-25 w-100 object-cover rounded-[10px]"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={staticData.navMain} />
        {/* <div className="mt-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <NavSecondary items={staticData.navSecondary} />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                Profile
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
