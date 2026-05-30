"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  CalendarClock,
  HelpCircle,
  Home,
  LogOut,
  MapPin,
  Scissors,
  Settings,
  Users,
} from "lucide-react";
import { signOut } from "@/lib/auth-client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const primaryItems = [
  { title: "Dashboard", url: "/vendor", icon: Home },
  { title: "Bookings", url: "/vendor/bookings", icon: CalendarClock },
  { title: "Services", url: "/vendor/services", icon: Scissors },
  { title: "Professionals", url: "/vendor/professionals", icon: Users },
  { title: "Locations", url: "/vendor/locations", icon: MapPin },
  { title: "Reports", url: "/vendor/reports", icon: BarChart3 },
];

const secondaryItems = [
  { title: "Settings", url: "/vendor/settings", icon: Settings },
  { title: "Support", url: "/vendor/support", icon: HelpCircle },
];

export function VendorSidebar({ startTransition }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleNav = (href) => (event) => {
    event.preventDefault();
    if (href === pathname) return;

    if (startTransition) {
      startTransition(() => router.push(href));
      return;
    }

    router.push(href);
  };

  return (
    <Sidebar collapsible="icon" className="top-0 border-r border-slate-200 bg-white">
      <SidebarHeader className="border-b border-slate-200 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              tooltip="Booksaa"
              className="h-12 hover:bg-transparent"
            >
              <button onClick={handleNav("/vendor")} type="button">
                <span className="flex size-9 items-center justify-center rounded-md border border-slate-200 bg-white">
                  <Image src="/logo.png" width={26} height={26} alt="Booksaa" />
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="font-semibold text-slate-950">Booksaa</span>
                  <span className="text-xs text-slate-500">Vendor panel</span>
                </span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryItems.map((item) => (
                <VendorSidebarItem
                  key={item.title}
                  item={item}
                  isActive={pathname === item.url}
                  onNavigate={handleNav(item.url)}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => (
                <VendorSidebarItem
                  key={item.title}
                  item={item}
                  isActive={pathname === item.url}
                  onNavigate={handleNav(item.url)}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign out"
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="text-slate-600 hover:text-slate-950"
            >
              <LogOut />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function VendorSidebarItem({ item, isActive, onNavigate }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={item.title}
        isActive={isActive}
        onClick={onNavigate}
        className="h-10 text-slate-600 data-[active=true]:bg-slate-900 data-[active=true]:text-white"
      >
        <item.icon />
        <span>{item.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
