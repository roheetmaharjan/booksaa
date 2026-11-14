"use client";

import AddLocation from "@/components/modals/AddLocation";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InfoIcon } from "@phosphor-icons/react";
import { PencilIcon, Plus } from "lucide-react";
import { useEffect, useState } from "react";

export function getLocationLabel(location) {
  return location?.name || location?.address || "Location";
}

export default function Locations({ form, selectedLocationId, refreshBusiness }) {
  const [plans, setPlans] = useState([]);
  const [openAddLocation, setOpenAddLocation] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);

  const selectedPlan = plans.find((plan) => plan.id === form?.planId) || form.plan || null;
  const locationLimit = Number(form?.subscriptionLocationLimit) || Number(selectedPlan?.location) || 1;
  const activeLocationCount = form.locations?.filter((location) => location.isActive !== false).length || 0;
  const selectedLocations = form.locations || [];

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch("/api/plans", { cache: "no-store" });
        const data = await response.json();
        setPlans(response.ok ? data.plans || data : []);
      } catch {
        setPlans([]);
      }
    };

    fetchPlans();
  }, []);

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        {activeLocationCount >= locationLimit ? (
          <Alert className="max-w-md border-amber-200 bg-amber-50 text-amber-900">
            <InfoIcon className="!top-[12px] text-amber-900" />
            <AlertTitle className="mb-0">
              Your current plan only allows {locationLimit} location{locationLimit > 1 ? "s" : ""}; all slots are used.
            </AlertTitle>
          </Alert>
        ) : (
          <Button
            onClick={() => {
              setEditingLocation(null);
              setOpenAddLocation(true);
            }}
          >
            <Plus className="size-4" />
            Add Business Location
          </Button>
        )}
      </div>

      <div className="space-y-5">
        {selectedLocations.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 rounded border py-6">
            <h4 className="text-lg font-bold">No Business Location added</h4>
            <p className="text-base">You haven't added a business location yet.</p>
          </div>
        )}
        {selectedLocations.length > 0 && (
          <Table className="border">
            <TableHeader>
              <TableRow>
                <TableHead>Branch Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Service Options</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedLocations.map((location) => (
                <TableRow key={location.id} data-state={location.id === selectedLocationId ? "selected" : undefined}>
                  <TableCell className="font-medium">
                    <div className="flex flex-wrap items-center gap-2">
                      {location.name || "Location"}
                      {location.isDefault && <Badge>Default</Badge>}
                      {location.id === selectedLocationId && <Badge variant="outline">Selected</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>{location.phone || form.phone || "-"}</TableCell>
                  <TableCell className="max-w-sm whitespace-normal">{location.address || "-"}</TableCell>
                  <TableCell>{[location.offerAtBusiness ? "At business" : "", location.offerAtClient ? "At client's place" : ""].filter(Boolean).join(", ") || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={location.isActive === false ? "secondary" : "default"}>{location.isActive === false ? "Inactive" : "Active"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingLocation(location);
                        setOpenAddLocation(true);
                      }}
                    >
                      <PencilIcon className="mr-2 size-4" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <AddLocation open={openAddLocation} setAddLocationOpen={setOpenAddLocation} vendorId={form.id} vendor={form} location={editingLocation} onAdded={(savedLocation) => refreshBusiness(savedLocation?.id || selectedLocationId)} />
    </>
  );
}
