"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("ADMIN");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.target;
    const identifier = form.elements.identifier?.value || "";
    const password = form.elements.password?.value || "";

    const result = await signIn("credentials", {
      redirect: false,
      identifier,
      password,
    });

    if (result?.error) {
      setError("Invalid credentials. Please try again.");
      setLoading(false);
    } else if (result?.ok) {
      // Fetch updated session
      const res = await fetch("/api/auth/session");
      const session = await res.json();
      const role = session?.user?.role;

      // Redirect based on role
      if (role === "ADMIN") router.replace("/admin");
      else if (role === "VENDOR") router.replace("/vendor");
      else router.replace("/customer");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center flex-1 h-[100vh]">
      <div className="w-full xl:max-w-[450px] px-8 max-w-[380px]">
        <div className="mb-8">
          <div className="logo">
            <Image src="/logo.png" width={100} height={30} alt="bookaroo" />
          </div>
        </div>
        <div className="mb-10">
          <h2 className="mb-2 font-bold text-3xl">Welcome back!</h2>
          <p className="font-semibold heading-text">
            Please enter your credentials to Log in!
          </p>
        </div>
        <div>
          <form onSubmit={handleLogin}>
            <div className="form-container vertical text-gray-500">
              <div className="flex flex-col mb-4">
                <label className="font-semibold flex">Username or Email</label>
                <input
                  className="w-full h-12 border rounded px-3 focus:ring-primary focus:border-primary"
                  placeholder="Username or Email"
                  autoComplete="off"
                  type="email"
                  name="identifier"
                  required
                />
              </div>
              <div className="flex flex-col mb-4">
                <label className="font-semibold flex">Password</label>
                <input
                  className="w-full h-12 border rounded px-3 focus:ring-primary focus:border-primary"
                  placeholder="Password"
                  autoComplete="off"
                  type="password"
                  name="password"
                  required
                />
              </div>
              <div className="mb-7 mt-2 text-right">
                <a
                  className="hover:underline font-semibold heading-text underline"
                  href="/forgot-password"
                >
                  Forgot password?
                </a>
              </div>
              {error && (
                <p className="text-red-600 text-sm mb-4">{error}</p>
              )}
              <button
                className="button flex items-center gap-2 justify-center text-white bg-primary hover:bg-primary-100 text-neutral h-12 rounded-md px-5 py-2 w-full"
                type="submit"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Log In"}
                {loading && <Loader2 className="animate-spin h-5 w-5 ml-2" />}
              </button>
            </div>
          </form>
        </div>
        <div className="mt-6 text-center">
          <span>Don&apos;t have an account yet? </span>
          <a className="hover:underline font-bold" href="/sign-up">
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}
