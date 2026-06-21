"use client";
import { signOut, useSession } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const Header = () => {
  const { data: session } = useSession();

  const pathUrl = usePathname();

  // Sticky Navbar
  const [sticky, setSticky] = useState(false);
  const handleStickyNavbar = () => {
    if (window.scrollY >= 80) {
      setSticky(true);
    } else {
      setSticky(false);
    }
  };
  useEffect(() => {
    window.addEventListener("scroll", handleStickyNavbar);
    return () => {
      window.removeEventListener("scroll", handleStickyNavbar);
    };
  }, []);

  if (pathUrl === "/business-signup") {
    return null;
  }

  return (
    <>
      <header className={`left-0 top-0 z-40 flex w-full items-center py-3 ${sticky ? "shadow-nav fixed z-[999] bg-[#062B3D] backdrop-blur-[5px] dark:border-dark-3/20 dark:bg-dark/10" : "absolute bg-transparent"}`}>
        <div className="container">
          <div className="relative -mx-4 flex items-center justify-between w-full">
            <div className="w-54 max-w-full px-4">
              <Link href="/" className={`navbar-logo block w-full ${sticky ? "py-2" : "py-5"} `}>
                {pathUrl !== "/" ? (
                  <>
                    <Image src={`/logo.png`} alt="logo" width={100} height={20} className="header-logo w-full dark:hidden" />
                    <Image src={`/logo.png`} alt="logo" width={100} height={20} className="header-logo hidden w-full dark:block" />
                  </>
                ) : (
                  <>
                    <Image src={`${sticky ? "/logo.png" : "/logo_white.png"}`} alt="logo" width={100} height={20} className="header-logo w-full dark:hidden" />
                    <Image src={"/logo.png"} alt="logo" width={100} height={20} className="header-logo hidden w-full dark:block" />
                  </>
                )}
              </Link>
            </div>
            {/* Nav */}
            <nav className={`hidden text-md md:flex ml-5 items-center gap-6 text-white  ${sticky ? "py-2" : "py-5"} `}>
              <a href="#">Features</a>
              <a href="#">Pricing</a>
              <a href="#">Industries</a>
              <a href="#">Resources</a>
              <a href="#">Contact</a>
            </nav>
            <div className="flex w-full items-center justify-end px-4">
              <div className="hidden items-center justify-end pr-16 sm:flex lg:pr-0">
                {session?.user ? (
                  <>
                    <p className={`loginBtn px-7 py-3 text-base  font-medium ${!sticky && pathUrl === "/" ? "text-white" : "text-dark"}`}>{session?.user?.name}</p>
                    {pathUrl !== "/" || sticky ? (
                      <button onClick={() => signOut()} className="signUpBtn rounded-lg bg-primary bg-opacity-100 px-6 py-3 text-base font-medium text-white duration-300 ease-in-out hover:bg-opacity-20 hover:text-dark">
                        Sign Out
                      </button>
                    ) : (
                      <button onClick={() => signOut()} className="signUpBtn rounded-lg bg-white bg-opacity-20 px-6 py-3 text-base font-medium text-white duration-300 ease-in-out hover:bg-opacity-100 hover:text-dark">
                        Sign Out
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {pathUrl !== "/" ? (
                      <>
                        <Link href="/auth/login" className="px-7 py-3 text-base font-medium text-dark hover:opacity-70 dark:text-white">
                          Log In
                        </Link>
                        <Link href="/signup" className="btn-primary">
                          Start Free Trial →
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link href="/auth/login" className="text-white px-7 py-3 text-base font-medium hover:opacity-70">
                          Log In
                        </Link>
                        <Link href="/business-pro" className="btn-primary">
                          Start Free Trial →
                        </Link>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
