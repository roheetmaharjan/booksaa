"use client"
import { Calendar, Home, Inbox } from "lucide-react";
import { usePathname,useRouter } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "Profile",
    url: "/admin/settings",
    icon: Inbox,  
  },
  {
    title: "Categories",
    url: "/admin/categories",
    icon: Home,
  }
];

export function SettingsSidebar({startTransition}) {
  const router = useRouter();
  const pathname = usePathname();
  const handleNav = (href) => (e) =>{
    e.preventDefault();
    startTransition(()=>{
      router.push(href);
    })
  }
  return (
    
    <Sidebar className="top-[53px]" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Accounts</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem
                    key={item.title}
                    className={isActive ? "bg-gray-200 font-bold" : ""}
                  >
                    <SidebarMenuButton asChild>
                      <button onClick={handleNav(`${item.url}`)}>
                        <item.icon />
                        <span>{item.title}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
