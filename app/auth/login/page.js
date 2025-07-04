"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

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
    const form = e.target;
    const identifier = form.elements.identifier?.value || "";
    const password = form.elements.password?.value || "";
    const result = await signIn("credentials", {
      redirect: false,
      identifier,
      password,
    });

    if (result?.error) {
      console.error(result.error);
    } else if (result?.ok) {
      window.location.reload(); // <-- This is the key change!
    }
  };

  return (
    <div>
      <div className=" flex flex-col justify-center items-center flex-1 bg-red-500">
        <div className="w-full xl:max-w-[450px] px-8 max-w-[380px]">
          <div className="mb-8">
            <div className="logo"></div>
          </div>
          <div className="mb-10">
            <h2 className="mb-2">Welcome back!</h2>
            <p className="font-semibold heading-text">
              Please enter your credentials to Log in!
            </p>
          </div>
          <div>
            <form onSubmit={handleLogin}>
              <div className="form-container vertical">
                <div className="form-item vertical">
                  <label className="form-label mb-2">Username or Email</label>
                  <div className="">
                    <input
                      className="input input-md h-12 focus:ring-primary focus-within:ring-primary focus-within:border-primary focus:border-primary"
                      placeholder="Username or Email"
                      autoComplete="off"
                      type="email"
                      name="identifier"
                    />
                  </div>
                </div>
                <div className="form-item vertical mb-0">
                  <label className="form-label mb-2">Password</label>
                  <div className="">
                    <span className="input-wrapper">
                      <input
                        className="input input-md h-12 focus:ring-primary focus-within:ring-primary focus-within:border-primary focus:border-primary"
                        placeholder="Password"
                        autoComplete="off"
                        type="password"
                        name="password"
                      />
                      <div className="input-suffix-end">
                        <span
                          className="cursor-pointer select-none text-xl"
                          role="button"
                        >
                          <svg
                            stroke="currentColor"
                            fill="none"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                            height="1em"
                            width="1em"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                            ></path>
                          </svg>
                        </span>
                      </div>
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
                  className="button bg-primary hover:bg-primary-mild text-neutral h-12 rounded-xl px-5 py-2 w-full button-press-feedback"
                  type="submit"
                >
                  Log In
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
              <span>Don't have an account yet? </span>
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
    </div>
  );
}
