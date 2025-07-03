"use client";
import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import "@/styles/globals.css";

export default function Layout({ children }) {
  return <AdminLayout>{children}</AdminLayout>;
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
