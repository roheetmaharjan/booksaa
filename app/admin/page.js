"use client";
import { useSession } from "@/lib/auth-client";

export default function AdminPage() {
  const { data: session } = useSession();

  return (
    <>
      <div className="container-fluid">
        <h4 className="page-title">
          Welcome to admin page, {session?.user?.name}
        </h4>
      </div>
    </>
  );
}
