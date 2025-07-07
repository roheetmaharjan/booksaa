"use client";
import Loading from "@/components/common/Loading";
import AdminHeader from "@/components/components_admin/AdminHeader";
import { useTransition } from "react";

export default function AdminLayout({ children }) {
  const [isPending,startTransition] = useTransition();
  return (
    <div>
      <AdminHeader startTransition={startTransition} />
      {isPending ? (
        <Loading />
      ) : (
        <main>{children}</main>
      )}
    </div>
  );
}
