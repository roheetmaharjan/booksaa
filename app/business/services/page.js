"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { MapPin, Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import ServiceList from "@/components/common/ServiceList";
import Loading from "@/components/common/Loading";
import { toast } from "sonner";

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationOpen, setLocationOpen] = useState(false);

  const locationId = searchParams.get("locationId");
  const locations = vendor?.locations || [];
  const effectiveLocationId =
    locationId || vendor?.selectedLocationId || vendor?.defaultLocationId || locations[0]?.id || "";
  const selectedLocation = locations.find((loc) => loc.id === effectiveLocationId) || locations[0];

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        setLoading(true);

        // Get current business
        const currentRes = await fetch("/api/businesses/current", {
          cache: "no-store",
        });
        const currentData = await currentRes.json();

        if (!currentRes.ok || !currentData.vendor) {
          toast.error("Failed to load business");
          setVendor(null);
          return;
        }

        const vendorId = currentData.vendor.id;

        // Fetch vendor with services filtered by location
        const url = effectiveLocationId
          ? `/api/businesses/${vendorId}?locationId=${effectiveLocationId}`
          : `/api/businesses/${vendorId}`;

        const vendorRes = await fetch(url, {
          cache: "no-store",
        });
        const vendorData = await vendorRes.json();

        if (!vendorRes.ok) {
          toast.error("Failed to load services");
          setVendor(null);
          return;
        }

        setVendor(vendorData);
      } catch (error) {
        console.error("Error fetching vendor:", error);
        toast.error("An error occurred while loading services");
        setVendor(null);
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [effectiveLocationId]);

  const handleLocationChange = (newLocationId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("locationId", newLocationId);
    setLocationOpen(false);
    router.push(`${pathname}?${params.toString()}`);
  };

  if (loading) {
    return <Loading />;
  }

  if (!vendor) {
    return (
      <div className="page-content">
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Failed to load services. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      {/* Header with Location Selector */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <h1 className="page-title">Services</h1>
        </div>
      </div>

      {/* Services List */}
      <div className="page-body">
        <ServiceList vendorId={vendor.id} locationId={effectiveLocationId} canManage={true} />
      </div>
    </div>
  );
}
