"use client";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect,useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading,setLoading] = useState(false)

  useEffect(() => {
    if (status === "loading") return;
    if (status === "authenticated") {
      const role = session?.user?.role;
      if (role === "ADMIN") router.replace("/admin");
      else if (role === "VENDOR") router.replace("/vendor");
      else router.replace("/customer");
    }
  }, [status, session, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form = e.target;
    const identifier = form.elements.identifier?.value || "";
    const password = form.elements.password?.value || "";
    const result = await signIn("credentials", {
      redirect: false,
      identifier,
      password,
    });

    setLoading(false);

    if (result?.error) {
      console.error(result.error);
    } else if (result?.ok) {
      window.location.reload(); 
    }
  };

  return (
    <>
      <div className=" flex flex-col justify-center items-center flex-1 h-[100vh]">
        <div className="w-full xl:max-w-[450px] px-8 max-w-[380px]">
          <div className="mb-8">
            <div className="logo">
              <Image
              src="/logo.png"
              width={100}
              height={30}
              alt="bookaroo"
              />
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
                <div className="flex flex-col">
                  <label className="font-semibold align-center flex">Username or Email</label>
                  <div className="">
                    <input
                      className="w-full h-12 focus:ring-primary focus-within:ring-primary focus-within:border-primary focus:border-primary"
                      placeholder="Username or Email"
                      autoComplete="off"
                      type="email"
                      name="identifier"
                    />
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold align-center flex">Password</label>
                  <div className="">
                    <span className="input-wrapper">
                      <input
                        className="w-full h-12 focus:ring-primary focus-within:ring-primary focus-within:border-primary focus:border-primary"
                        placeholder="Password"
                        autoComplete="off"
                        type="password"
                        name="password"
                      />
                    </span>
                  </div>
                </div>
                <div className="mb-7 mt-2">
                  <a
                    className="hover:underline font-semibold heading-text mt-2 underline"
                    href="/forgot-password"
                    data-discover="true"
                  >
                    Forgot password
                  </a>
                </div>
                <button
                  className="button flex items-center gap-2 justify-center text-white bg-primary hover:bg-primary-100 text-neutral h-12 rounded-md px-5 py-2 w-full button-press-feedback"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Log In"}
                  {loading&& <Loader2 className="animate-spin h-5 w-5 mr-2"/>}
                </button>
              </div>
            </form>
          </div>
          {/* <div className="mt-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="border-t border-gray-200 dark:border-gray-800 flex-1 mt-[1px]"></div>
              <p className="font-semibold heading-text">or countinue with</p>
              <div className="border-t border-gray-200 dark:border-gray-800 flex-1 mt-[1px]"></div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="button bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-700 ring-primary dark:ring-white hover:border-primary dark:hover:border-white hover:ring-1 hover:text-primary dark:hover:text-white dark:hover:bg-transparent text-gray-600 dark:text-gray-100 h-12 rounded-xl px-5 py-2 flex-1 button-press-feedback"
                type="button"
              >
                <div className="flex items-center justify-center gap-2">
                  <img
                    className="h-[25px] w-[25px]"
                    alt="Google sign in"
                    src="/img/others/google.png"
                  />
                  <span>Google</span>
                </div>
              </button>
              <button
                className="button bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-700 ring-primary dark:ring-white hover:border-primary dark:hover:border-white hover:ring-1 hover:text-primary dark:hover:text-white dark:hover:bg-transparent text-gray-600 dark:text-gray-100 h-12 rounded-xl px-5 py-2 flex-1 button-press-feedback"
                type="button"
              >
                <div className="flex items-center justify-center gap-2">
                  <img
                    className="h-[25px] w-[25px]"
                    alt="Google sign in"
                    src="/img/others/github.png"
                  />
                  <span>Github</span>
                </div>
              </button>
            </div>
          </div> */}
          <div>
            <div className="mt-6 text-center">
              <span>Don&apos;t have an account yet? </span>
              <a
                className="hover:underline heading-text font-bold"
                href="/sign-up"
                data-discover="true"
              >
                Sign up
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
