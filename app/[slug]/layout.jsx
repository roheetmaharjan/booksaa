"use client";

import Loading from "@/components/common/Loading";
import { VendorSidebar } from "@/components/components_vendor/VendorSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useTransition } from "react";

export default function VendorLayout({ children }) {
  const [isPending, startTransition] = useTransition();

  return (
    <SidebarProvider
      className="min-h-screen overflow-hidden bg-[#062B3D]"
      style={{
        "--sidebar-width": "17rem",
        "--sidebar-width-mobile": "18rem",
        "--sidebar-width-icon" : "3.5rem"
      }}
    >
      <VendorSidebar startTransition={startTransition} />
      <SidebarInset className="rounded-xl border shadow-lg overflow-y-auto content-area bg-white">
        {isPending ? <Loading /> : children}
      </SidebarInset>
    </SidebarProvider>
  );
}
