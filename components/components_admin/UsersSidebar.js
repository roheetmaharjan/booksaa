"use client"
import { UsersIcon, StorefrontIcon,UsersFourIcon } from "@phosphor-icons/react";
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
    title: "Users",
    url: "/admin/users",
    icon: UsersIcon,
  },
  {
    title: "Vendors",
    url: "/admin/vendors",
    icon: StorefrontIcon,  
  },
  {
    title: "Customers",
    url: "/admin/customers",
    icon: UsersFourIcon,
  },
];

export function UsersSidebar({startTransition}) {
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
                        <item.icon weight="duotone" size={30} />
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
