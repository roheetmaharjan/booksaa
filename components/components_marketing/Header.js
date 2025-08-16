"use client";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const Header = () => {
  const { data: session } = useSession();

  const pathUrl = usePathname();
  // Navbar toggle
  const [navbarOpen, setNavbarOpen] = useState(false);
  const navbarToggleHandler = () => {
    setNavbarOpen(!navbarOpen);
  };

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
  });

  // submenu handler
  const [openIndex, setOpenIndex] = useState(-1);
  const handleSubmenu = () => {
    if (openIndex === index) {
      setOpenIndex(-1);
    } else {
      setOpenIndex(index);
    }
  };


  return (
    <>
      <header
        className={`bg-black left-0 top-0 z-40 flex w-full items-center py-3 ${
          sticky
            ? "shadow-nav fixed z-[999] border-b border-stroke bg-white/80 backdrop-blur-[5px] dark:border-dark-3/20 dark:bg-dark/10"
            : "absolute bg-transparent"
        }`}
      >
        <div className="container">
          <div className="relative -mx-4 flex items-center justify-between w-full">
            <div className="w-54 max-w-full px-4">
              <Link
                href="/"
                className={`navbar-logo block w-full ${
                  sticky ? "py-2" : "py-5"
                } `}
              >
                {pathUrl !== "/" ? (
                  <>
                    <Image
                      src={`/logo.png`}
                      alt="logo"
                      width={100}
                      height={20}
                      className="header-logo w-full dark:hidden"
                    />
                    <Image
                      src={`/logo.png`}
                      alt="logo"
                      width={100}
                      height={20}
                      className="header-logo hidden w-full dark:block"
                    />
                  </>
                ) : (
                  <>
                    <Image
                      src={`${
                        sticky
                          ? "/logo.png"
                          : "/logo_white.png"
                      }`}
                      alt="logo"
                      width={100}
                      height={20}
                      className="header-logo w-full dark:hidden"
                    />
                    <Image
                      src={"/logo.png"}
                      alt="logo"
                      width={100}
                      height={20}
                      className="header-logo hidden w-full dark:block"
                    />
                  </>
                )}
              </Link>
            </div>
            <div className="flex w-full items-center justify-end px-4">
              <div className="hidden items-center justify-end pr-16 sm:flex lg:pr-0">
                {session?.user ? (
                  <>
                    <p
                      className={`loginBtn px-7 py-3 text-base font-medium ${
                        !sticky && pathUrl === "/" ? "text-white" : "text-dark"
                      }`}
                    >
                      {session?.user?.name}
                    </p>
                    {pathUrl !== "/" || sticky ? (
                      <button
                        onClick={() => signOut()}
                        className="signUpBtn rounded-lg bg-primary bg-opacity-100 px-6 py-3 text-base font-medium text-white duration-300 ease-in-out hover:bg-opacity-20 hover:text-dark"
                      >
                        Sign Out
                      </button>
                    ) : (
                      <button
                        onClick={() => signOut()}
                        className="signUpBtn rounded-lg bg-white bg-opacity-20 px-6 py-3 text-base font-medium text-white duration-300 ease-in-out hover:bg-opacity-100 hover:text-dark"
                      >
                        Sign Out
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {pathUrl !== "/" ? (
                      <>
                        <Link
                          href="/signin"
                          className="px-7 py-3 text-base font-medium text-dark hover:opacity-70 dark:text-white"
                        >
                          Login In
                        </Link>
                        <Link
                          href="/signup"
                          className="rounded-lg bg-primary px-6 py-3 text-base font-medium text-white duration-300 ease-in-out hover:bg-primary/90 dark:bg-white/10 dark:hover:bg-white/20"
                        >
                          List your business
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/signin"
                          className={`px-7 py-3 text-base font-medium hover:opacity-70 ${
                            sticky ? "text-dark dark:text-white" : "text-white"
                          }`}
                        >
                          Log In
                        </Link>
                        <Link
                          href="/signup"
                          className={`rounded-lg px-6 py-3 text-base font-medium text-white duration-300 ease-in-out ${
                            sticky
                              ? "bg-primary hover:bg-primary/90 dark:bg-white/10 dark:hover:bg-white/20"
                              : "bg-white/10 hover:bg-white/20"
                          }`}
                        >
                          List your business
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
