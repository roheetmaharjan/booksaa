"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BarChart3, CalendarClock, Check, ChevronDown, HelpCircle, Home, MapPin, Scissors, Settings, Store, Users } from "lucide-react";
import { BellIcon, CreditCardIcon, RocketLaunchIcon, SignOutIcon, UserCircleIcon } from "@phosphor-icons/react";
import { signOut } from "@/lib/auth-client";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const primaryItems = [
  { title: "Dashboard", url: "/business", icon: Home },
  { title: "Bookings", url: "/business/bookings", icon: CalendarClock },
  { title: "Services", url: "/business/services", icon: Scissors },
  { title: "Professionals", url: "/business/professionals", icon: Users },
  { title: "Reports", url: "/business/reports", icon: BarChart3 },
];

const secondaryItems = [
  { title: "Settings", url: "/business/settings", icon: Settings },
  { title: "Support", url: "/business/support", icon: HelpCircle },
];

export function VendorSidebar({ startTransition }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [business, setBusiness] = useState(null);
  const [locationOpen, setLocationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const locations = business?.locations || [];
  const owner = business?.owner || {};
  const selectedLocationId = searchParams.get("locationId") || business?.defaultLocationId || locations[0]?.id || "";
  const selectedLocation = locations.find((location) => location.id === selectedLocationId) || locations[0];
  const businessInitial = useMemo(() => {
    const name = business?.name?.trim();
    return name ? name.charAt(0).toUpperCase() : <Store className="size-4" />;
  }, [business?.name]);
  const ownerName = [owner.firstname, owner.lastname].filter(Boolean).join(" ") || owner.email || "Owner";
  const ownerInitial = ownerName.trim().charAt(0).toUpperCase() || "O";

  useEffect(() => {
    let isActive = true;

    const fetchBusiness = async () => {
      try {
        const res = await fetch("/api/businesses/current", {
          cache: "no-store",
        });
        const data = await res.json();

        if (res.ok && isActive) {
          setBusiness(data.vendor || null);
        }
      } catch {
        if (isActive) {
          setBusiness(null);
        }
      }
    };

    fetchBusiness();

    return () => {
      isActive = false;
    };
  }, []);

  const handleNav = (href) => (event) => {
    event.preventDefault();
    if (href === pathname) return;

    if (startTransition) {
      startTransition(() => router.push(href));
      return;
    }

    router.push(href);
  };

  const handleLocationChange = (locationId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("locationId", locationId);
    const href = `${pathname || "/business"}?${params.toString()}`;

    if (startTransition) {
      startTransition(() => router.push(href));
      return;
    }

    router.push(href);
  };

  const withSelectedLocation = (href) => {
    if (!selectedLocationId) return href;
    const params = new URLSearchParams(searchParams.toString());
    params.set("locationId", selectedLocationId);
    return `${href}?${params.toString()}`;
  };

  const navigateTo = (href) => {
    setProfileOpen(false);

    if (startTransition) {
      startTransition(() => router.push(href));
      return;
    }

    router.push(href);
  };

  const openBillingUsage = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedLocationId) params.set("locationId", selectedLocationId);
    navigateTo(`/business?${params.toString()}#usage-billing`);
  };

  const openGetStarted = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("setup", "step4");
    if (selectedLocationId) params.set("locationId", selectedLocationId);
    navigateTo(`/business?${params.toString()}`);
  };

  return (
    <Sidebar collapsible="icon" className="top-0 border-r border-slate-200 bg-white">
      <SidebarHeader className="border-b border-slate-200 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            {locations.length > 1 ? (
              <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                <PopoverTrigger asChild>
                  <SidebarMenuButton size="lg" tooltip={business?.name || "Business"} className="h-12 hover:bg-slate-50">
                    <BusinessIdentity business={business} selectedLocation={selectedLocation} businessInitial={businessInitial} />
                    <ChevronDown className="ml-auto size-4 text-slate-400 group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                </PopoverTrigger>
                <PopoverContent align="start" side="right" className="w-72 p-2">
                  <div className="px-2 pb-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Locations</div>
                  <div className="grid gap-1">
                    {locations.map((location) => {
                      const isSelected = location.id === selectedLocationId;
                      return (
                        <button
                          key={location.id}
                          type="button"
                          onClick={() => {
                            setLocationOpen(false);
                            handleLocationChange(location.id);
                          }}
                          className="flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                        >
                          <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium text-slate-900">{location.name || "Unnamed location"}</span>
                            <span className="block truncate text-xs text-slate-500">{location.address || "No address"}</span>
                          </span>
                          {isSelected && <Check className="mt-0.5 size-4 shrink-0 text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <SidebarMenuButton asChild size="lg" tooltip={business?.name || "Business"} className="h-12 hover:bg-transparent">
                <button onClick={handleNav(withSelectedLocation("/business"))} type="button">
                  <BusinessIdentity business={business} selectedLocation={selectedLocation} businessInitial={businessInitial} />
                </button>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryItems.map((item) => (
                <VendorSidebarItem key={item.title} item={item} isActive={pathname === item.url} onNavigate={handleNav(withSelectedLocation(item.url))} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => (
                <VendorSidebarItem key={item.title} item={item} isActive={pathname === item.url} onNavigate={handleNav(withSelectedLocation(item.url))} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <Popover open={profileOpen} onOpenChange={setProfileOpen}>
              <PopoverTrigger asChild>
                <SidebarMenuButton tooltip="Owner profile" className="h-11 justify-start text-slate-700 hover:bg-slate-50 hover:text-slate-950">
                  <OwnerAvatar owner={owner} ownerName={ownerName} ownerInitial={ownerInitial} />
                  <span className="min-w-0 flex-1 truncate">{ownerName}</span>
                </SidebarMenuButton>
              </PopoverTrigger>
              <PopoverContent align="start" side="right" className="w-80 overflow-hidden rounded-lg border-slate-200 bg-white p-0 text-slate-950 shadow-lg">
                <div className="flex items-center gap-3 border-b border-slate-200 p-4">
                  <OwnerAvatar owner={owner} ownerName={ownerName} ownerInitial={ownerInitial} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{ownerName}</p>
                    <p className="truncate text-xs text-slate-500">{owner.email || "No email available"}</p>
                  </div>
                </div>

                <div className="grid gap-1 p-2">
                  <ProfileMenuButton icon={UserCircleIcon} label="My Profile" onClick={() => navigateTo(withSelectedLocation("/business/my-profile"))} />
                  <ProfileMenuButton icon={CreditCardIcon} label="Billing & Usage" onClick={() => navigateTo(withSelectedLocation("/business/billing-usage"))} />
                  <ProfileMenuButton icon={BellIcon} label="Notifications" onClick={() => navigateTo(withSelectedLocation("/business/notifications"))} />
                  <ProfileMenuButton icon={RocketLaunchIcon} label="Get Started" onClick={openGetStarted} />
                </div>

                <div className="border-t border-slate-200 p-3">
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/auth/login" })}
                    className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white text-sm font-semibold text-slate-900 hover:bg-slate-50"
                  >
                    <SignOutIcon className="size-5" weight="regular" />
                    Log Out
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function OwnerAvatar({ owner, ownerName, ownerInitial, size = "md" }) {
  const sizeClass = size === "lg" ? "size-11 text-base" : "size-8 text-sm";

  return (
    <span
      aria-label={`${ownerName} profile`}
      className={`flex ${sizeClass} shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 font-semibold text-slate-800`}
      style={owner?.image ? { backgroundImage: `url(${owner.image})`, backgroundPosition: "center", backgroundSize: "cover" } : undefined}
    >
      {!owner?.image && ownerInitial}
    </span>
  );
}

function ProfileMenuButton({ icon: Icon, label, onClick }) {
  return (
    <button type="button" onClick={onClick} className="flex h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950">
      <Icon className="size-5 text-slate-500" weight="regular" />
      <span>{label}</span>
    </button>
  );
}

function BusinessIdentity({ business, selectedLocation, businessInitial }) {
  return (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900">
        {business?.image ? (
          <Image src={business.image} width={36} height={36} alt={`${business.name} logo`} className="size-full object-cover" />
        ) : (
          businessInitial
        )}
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate font-semibold text-slate-950">{business?.name || "Business"}</span>
        <span className="truncate text-xs text-slate-500">{selectedLocation?.name || selectedLocation?.address || "Vendor panel"}</span>
      </span>
    </>
  );
}

function VendorSidebarItem({ item, isActive, onNavigate }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton tooltip={item.title} isActive={isActive} onClick={onNavigate} className="h-10 text-slate-600 data-[active=true]:bg-primary data-[active=true]:text-white">
        <item.icon />
        <span>{item.title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
