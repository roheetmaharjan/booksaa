"use client";
import { useSession } from "next-auth/react";

export default function AdminPage() {
  const { data: session } = useSession();

  return (
    <div>
      
      <main>
        Welcome to admin page, {session?.user?.name}
      </main>
    </div>
  );
}