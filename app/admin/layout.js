"use client";
import SessionWrapper from "@/components/components_admin/SessionWrapper";
import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import "@/styles/globals.css";

export default function Layout({ children }) {
  return (
    <SessionWrapper>
      <AdminLayout>{children}</AdminLayout>
    </SessionWrapper>
  );
}

function AdminLayout({ children }) {
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn(undefined, { callbackUrl: "/admin" });
    }
  }, [status]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "authenticated") {
    return (
      <div>
        {/* <SideNavigation /> */}
        <main>{children}</main>
      </div>
    );
  }

  return null;
}
