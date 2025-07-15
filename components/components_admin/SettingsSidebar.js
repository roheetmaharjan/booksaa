"use client"
import { GearIcon,StackIcon,CreditCardIcon,BellIcon,GavelIcon,EnvelopeIcon,FileTextIcon } from "@phosphor-icons/react";
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
    title: "General",
    url: "/admin/settings",
    icon: GearIcon,  
  },
  {
    title: "Categories",
    url: "/admin/settings/categories",
    icon: StackIcon,
  },
  {
    title: "Payment",
    url: "/admin/settings/payments",
    icon: CreditCardIcon,
  },
  {
    title: "Notification",
    url: "/admin/settings/notification",
    icon: BellIcon,
  },
  {
    title: "Legal",
    url: "/admin/settings/legal",
    icon: GavelIcon,
  },
  {
    title: "Email Templates",
    url: "/admin/settings/emailtemplates",
    icon: EnvelopeIcon,
  },
  {
    title: "Plans",
    url: "/admin/settings/plans",
    icon: FileTextIcon,
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
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
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
                        <item.icon weight="duotone" size={40} />
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
