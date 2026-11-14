"use client";

import Image from "next/image";
import Link from "next/link";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";

const industries = [
  ["Hair Salons", "Skincare Studios", "Hair Removal", "Barbershops"],
  ["Med Spas", "Beauty Studios", "Tattoo & Piercing", "Wellness Centers"],
  ["IV Therapy", "Massage Studios", "Nail Salons", "Spas"],
];

export function IndustriesMegaMenu() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="group bg-transparent text-base font-medium hover:bg-transparent data-[state=open]:bg-transparent">
            Industries
            {/* <ChevronDown className="ml-1 h-4 w-4 transition-transform duration-300 group-data-[state=open]:rotate-180" /> */}
          </NavigationMenuTrigger>

          <NavigationMenuContent className="!left-1/2 !-translate-x-1/2 z-20">
            <div className="mega-menu-enter grid w-[min(1240px,calc(100vw-2rem))] grid-cols-4 gap-8 rounded-[28px] border border-slate-200 bg-white p-10 shadow-xl">
              {/* Industry links */}
              <div className="col-span-3">
                <p className="mb-8 font-mono text-xs font-semibold uppercase tracking-widest text-slate-500">Industries We Work...</p>

                <div className="grid grid-cols-3 gap-8">
                  {industries.map((column, index) => (
                    <div key={index} className="space-y-6">
                      {column.map((industry) => (
                        <Link key={industry} href={`/industries/${industry.toLowerCase().replaceAll(" ", "-").replaceAll("&", "and")}`} className="group/link block text-[19px] font-medium tracking-tight text-slate-900 transition-all duration-200 hover:translate-x-1 hover:text-fuchsia-600">
                          {industry}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Promotional image */}
              <div className="relative min-h-[250px] overflow-hidden rounded-[28px]">
                <Image src="/images/industries-mega-menu.jpg" alt="Beauty business owner" fill sizes="350px" className="object-cover transition-transform duration-700 hover:scale-105" />
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
