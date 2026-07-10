"use client";

import Loading from "@/components/common/Loading";
import { VendorSidebar } from "@/components/components_vendor/VendorSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useTransition } from "react";

export default function VendorLayout({ children }) {
  const [isPending, startTransition] = useTransition();

  return (
    <SidebarProvider
      className="min-h-screen bg-transparent bg-slate-50 overflow-hidden"
      style={{
        "--sidebar-width": "17rem",
        "--sidebar-width-mobile": "18rem",
      }}
    >
      <VendorSidebar startTransition={startTransition} />
      <SidebarInset className="rounded-xl border shadow-lg overflow-y-auto content-area">
        {isPending ? <Loading /> : children}
      </SidebarInset>
    </SidebarProvider>
  );
}
