"use client";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      // Redirect based on user role
      const role = session?.user?.role;
      if (role === "admin") router.replace("/admin");
      else if (role === "vendor") router.replace("/vendor");
      else router.replace("/customer");
    }
  }, [status, session, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    // You can add fields for username/email and password
    await signIn("credentials", {
      redirect: false,
      username: e.target.username.value,
      password: e.target.password.value,
    });
  };

  return (
    <div>
      <SessionProvider>
        <h1>Login</h1>
        <form onSubmit={handleLogin}>
          <input name="username" placeholder="Username" required />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
          />
          <button type="submit">Sign In</button>
        </form>
      </SessionProvider>
    </div>
  );
}
