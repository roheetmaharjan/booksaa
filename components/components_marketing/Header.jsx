"use client";
import { signOut, useSession } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import StartFreeTrialButton from "@/components/common/StartFreeTrialButton";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";

const industries = [
  ["Hair Salons", "Skincare Studios", "Hair Removal", "Barbershops"],
  ["Med Spas", "Beauty Studios", "Tattoo & Piercing", "Wellness Centers"],
  ["IV Therapy", "Massage Studios", "Nail Salons", "Spas"],
];

const Header = () => {
  const { data: session } = useSession();

  const pathUrl = usePathname();
  const isHomePage = pathUrl === "/";

  // Sticky Navbar
  const [sticky, setSticky] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  return (
    <>
      <header className={`left-0 top-0 z-40 w-full py-3 ${isHomePage ? (sticky ? "light-header" : "dark-header") : sticky ? "inner-header light-header" : "inner-header"}`}>
        <div className="container-fluid !p-0 !px-8 relative z-20">
          <div className="relative w-full items-center justify-between grid grid-cols-3">
            <div className="shrink-0 w-70">
              <Link href="/" className="block w-full">
                <Image src={`/logo_white.png`} alt="booksaa" width={140} height={30} className="!w-auto h-[32px] object-contain light-logo" />
                <Image src={`/logo.png`} alt="booksaa" width={140} height={30} className="!w-auto h-[32px] object-contain dark-logo" />
              </Link>
            </div>
            {/* Nav */}
            <div className="flex justify-center items-center">
              <NavigationMenu className="hidden flex-1 !justify-start lg:flex header-navigation">
                <NavigationMenuList className="justify-start font-semibold">
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="!px-3 text-base font-semibold bg-transparent">Solutions</NavigationMenuTrigger>

                    <NavigationMenuContent className="!absolute !left-0 !w-full p-10">
                      <div className="grid !w-full grid-cols-1 gap-6 !border-none !shadow-none sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                        {/* Industry links */}
                        <div className="sm:col-span-1 lg:col-span-3">
                          <p className="text-xs font-medium mb-6 uppercase text-gray-600"> Solution For Following Business Type</p>
                          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                            {industries.map((column, index) => (
                              <div key={index} className="space-y-6">
                                {column.map((industry) => (
                                  <Link key={industry} href={`/industries/${industry.toLowerCase().replaceAll(" ", "-").replaceAll("&", "and")}`} className="group/link block text-[16px] font-medium tracking-tight text-slate-900 transition-all duration-200 hover:translate-x-1 hover:text-primary">
                                    {industry}
                                  </Link>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Promotional image */}
                        <div className="relative hidden min-h-[250px] overflow-hidden rounded-[28px] sm:block bg-gray-200">
                          <Image src="/menu-image.jpg" alt="Business owner" fill sizes="350px" className="object-cover transition-transform duration-700 hover:scale-105" />
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link href="/features" className="py-2 px-2">
                      Features
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link href="/pricing" className="py-2 px-2">
                      Pricing
                    </Link>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Link href="/contact-sales" className="py-2 px-2">
                      Contact Sales
                    </Link>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
            <div className="flex items-center justify-end gap-2 w-70">
              <div className="hidden items-center justify-end lg:flex">
                {session?.user ? (
                  <>
                    <p className={`loginBtn px-7 py-3 text-base  font-medium ${!sticky && pathUrl === "/" ? "text-white" : "text-dark"}`}>{session?.user?.name}</p>
                    {pathUrl !== "/" || sticky ? (
                      <button onClick={() => signOut()} className="signUpBtn rounded-lg bg-primary bg-opacity-100 px-6 py-3 text-base font-medium duration-300 ease-in-out hover:bg-opacity-20 hover:text-dark">
                        Sign Out
                      </button>
                    ) : (
                      <button onClick={() => signOut()} className="signUpBtn rounded-lg bg-opacity-20 px-6 py-3 text-base font-medium duration-300 ease-in-out hover:bg-opacity-100 hover:text-dark">
                        Sign Out
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {pathUrl !== "/" ? (
                      <>
                        <Link href="/auth/login" className="px-7 py-3 text-base font-semibold text-dark hover:opacity-70">
                          Log In
                        </Link>
                        <StartFreeTrialButton>Start Free Trial →</StartFreeTrialButton>
                      </>
                    ) : (
                      <>
                        <Link href="/auth/login" className="px-7 py-3 text-base font-semibold hover:opacity-70">
                          Log In
                        </Link>
                        <StartFreeTrialButton>Start Free Trial →</StartFreeTrialButton>
                      </>
                    )}
                  </>
                )}
              </div>
              <button type="button" aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((open) => !open)} className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white lg:hidden">
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
          {mobileMenuOpen && (
            <nav aria-label="Mobile navigation" className="mt-3 border-t border-white/15 px-2 pt-3 lg:hidden">
              <div className="flex flex-col">
                <p className="px-3 py-2 text-sm font-semibold">Solutions</p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 pb-3 pl-3 sm:grid-cols-3">
                  {industries.flat().map((industry) => (
                    <Link key={industry} onClick={() => setMobileMenuOpen(false)} href={`/industries/${industry.toLowerCase().replaceAll(" ", "-").replaceAll("&", "and")}`} className="rounded px-2 py-2 text-sm text-white/85 hover:bg-white/10">
                      {industry}
                    </Link>
                  ))}
                </div>
                <Link onClick={() => setMobileMenuOpen(false)} href="/features" className="rounded px-3 py-3 hover:bg-white/10">
                  Features
                </Link>
                <Link onClick={() => setMobileMenuOpen(false)} href="/pricing" className="rounded px-3 py-3 hover:bg-white/10">
                  Pricing
                </Link>
                <Link onClick={() => setMobileMenuOpen(false)} href="/contact-sales" className="rounded px-3 py-3 hover:bg-white/10">
                  Contact Sales
                </Link>
                {session?.user ? (
                  <>
                    <p className="px-3 py-3 text-sm">{session.user.name}</p>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        signOut();
                      }}
                      className="rounded px-3 py-3 text-left hover:bg-white/10"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link onClick={() => setMobileMenuOpen(false)} href="/auth/login" className="rounded px-3 py-3 hover:bg-white/10">
                      Log In
                    </Link>
                    <div className="px-3 py-2">
                      <StartFreeTrialButton>Start Free Trial →</StartFreeTrialButton>
                    </div>
                  </>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;
