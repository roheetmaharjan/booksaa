"use client";
import Loading from "@/components/common/Loading";
import AdminHeader from "@/components/components_admin/AdminHeader";
import { useTransition } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UsersSidebar } from "@/components/components_admin/UsersSidebar";
import { SettingsSidebar } from "@/components/components_admin/SettingsSidebar";

export default function AdminLayout({ children }) {
  const [isPending, startTransition] = useTransition();
  return (
    <div>
      <AdminHeader startTransition={startTransition} />
        {isPending ? <Loading /> : <main>{children}</main>}
    </div>
  );
}

export function UsersLayout({ children }) {
  const [isPending, startTransition] = useTransition();
  return (
    <SidebarProvider className="min-h-fit">
      <UsersSidebar startTransition={startTransition} />
      {isPending ?
        <Loading />
       : 
        <main className="flex-1">
          <SidebarTrigger className="flex md:hidden"  />
          <div className="container-fluid">
            {children}
          </div>
        </main>
      }
    </SidebarProvider>
  );
}
export function SettingsLayout({ children }) {
  const [isPending, startTransition] = useTransition();
  return (
    <SidebarProvider className="min-h-fit">
      <SettingsSidebar startTransition={startTransition} />
      {isPending ?
        <Loading />
       : 
        <main className="flex-1">
          <SidebarTrigger className="flex md:hidden" />
          <div className="container-fluid">
            {children}
          </div>
        </main>
      }
    </SidebarProvider>
  );
}
