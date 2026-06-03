"use client";

import Loading from "@/components/common/Loading";
import { VendorSidebar } from "@/components/components_vendor/VendorSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useTransition } from "react";

export default function VendorLayout({ children }) {
  const [isPending, startTransition] = useTransition();

  return (
    <SidebarProvider
      className="min-h-screen bg-slate-50"
      style={{
        "--sidebar-width": "17rem",
        "--sidebar-width-mobile": "18rem",
      }}
    >
      <VendorSidebar startTransition={startTransition} />
      <SidebarInset className="bg-slate-50">
        {isPending ? <Loading /> : children}
      </SidebarInset>
    </SidebarProvider>
  );
}
