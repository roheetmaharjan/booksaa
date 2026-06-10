import { useState, useEffect } from "react";
import AddService from "@/components/modals/AddService";
import EditService from "@/components/modals/EditService";
import ConfirmAlert from "@/components/common/ConfirmAlert";
import Loading from "@/components/common/Loading";
import { TrashIcon, PencilLineIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { useFetch } from "@/hooks/useFetch";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ServiceList({ vendorId, locationId, canManage = false }) {
  const [openAddService, setAddServiceOpen] = useState(false);
  const [openEditService, setEditServiceOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [vendor, setVendorDetail] = useState(null);
  const [openAlert, setAlertOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const { data: fetchedLocations } = useFetch(vendorId ? `/api/businesses/${vendorId}/locations` : null);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    if (fetchedLocations) {
      setLocations(fetchedLocations);
    }
  }, [fetchedLocations]);

  useEffect(() => {
    if (!vendorId) return;
    setLoading(true);
    const url = locationId ? `/api/businesses/${vendorId}?locationId=${locationId}` : `/api/businesses/${vendorId}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setVendorDetail(data);
        setLoading(false);
      })
      .catch((err) => {
        setVendorDetail(null);
        setLoading(false);
        toast.error(err.message);
      });
  }, [vendorId, locationId]);

  if (loading) return <Loading />;
  if (!vendor) return <p>No vendor found.</p>;

  // show button only if pathname contains "edit-business" or canManage is true
  const showAddButton = canManage || pathname.includes("edit-business");
  const showActionButton = canManage || pathname.includes("edit-business");

  const handleDeleteServiceClick = (service) => {
    setSelectedService(service);
    setAlertOpen(true);
  };

  const handleEditServiceClick = (service) => {
    setSelectedService(service);
    setEditServiceOpen(true);
  };

  const handleDeleteService = async () => {
    try {
      const res = await fetch(`/api/services/${selectedService.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Service deleted successfully");
        const updated = await fetch(`/api/businesses/${vendorId}`).then((res) => res.json());
        setVendorDetail(updated);
      } else {
        toast.error(data.error || "Failed to delete service");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An error occured");
    }
  };

  return (
    <>
      <div className="card">
        <div className="card-header">
          {showAddButton && (
            <>
              <Button onClick={() => setAddServiceOpen(true)}>Add Service</Button>
              <AddService
                open={openAddService}
                setAddServiceOpen={setAddServiceOpen}
                vendorId={vendorId}
                locations={locations}
                locationId={locationId || vendor.selectedLocationId}
                onAdded={async () => {
                  const updatedVendor = await fetch(locationId ? `/api/businesses/${vendorId}?locationId=${locationId}` : `/api/businesses/${vendorId}`).then((r) => r.json());
                  setVendorDetail(updatedVendor);
                }}
              />
            </>
          )}
        </div>
        <div className="card-body">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">S.N</TableHead>
                <TableHead className="w-20">Color</TableHead>
                <TableHead className="w-1/6">Service Name</TableHead>
                <TableHead className="w-1/3">Description</TableHead>
                <TableHead className="w-28">Price</TableHead>
                <TableHead className="w-1/6">
                  Duration <small>(min)</small>
                </TableHead>
                {showActionButton && <TableHead className="w-1/5">Action</TableHead>}
              </TableRow>
            </TableHeader>

            <TableBody>
              {vendor.services && vendor.services.length > 0 ? (
                vendor.services.map((service, index) => (
                  <TableRow key={service.id}>
                    <TableCell className="text-center">{index + 1}</TableCell>

                    <TableCell>
                      <span
                        className="inline-block h-5 w-5 rounded-full border border-gray-200"
                        style={{
                          backgroundColor: service.color || "#2563eb",
                        }}
                      />
                    </TableCell>

                    <TableCell>{service.name}</TableCell>

                    <TableCell>{service.description || "-"}</TableCell>

                    <TableCell>$ {service.price}</TableCell>

                    <TableCell>{service.duration} min</TableCell>

                    {showActionButton && (
                      <TableCell>
                        <div className="flex gap-2">
                          <button className="text-gray-500" onClick={() => handleEditServiceClick(service)}>
                            <PencilLineIcon size={20} weight="duotone" />
                          </button>

                          <button className="text-red-500" onClick={() => handleDeleteServiceClick(service)}>
                            <TrashIcon size={20} weight="duotone" />
                          </button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={showActionButton ? 7 : 6} className="text-center py-4">
                    No services found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {selectedService && (
            <EditService
              openEdit={openEditService}
              setEditServiceOpen={setEditServiceOpen}
              vendorId={vendorId}
              locations={locations}
              locationId={locationId || vendor.selectedLocationId}
              service={selectedService}
              onEdited={async () => {
                const updatedVendor = await fetch(locationId ? `/api/businesses/${vendorId}?locationId=${locationId}` : `/api/businesses/${vendorId}`).then((r) => r.json());
                setVendorDetail(updatedVendor);
              }}
            />
          )}
          {openAlert && <ConfirmAlert open={openAlert} onOpenChange={setAlertOpen} title="Delete Service?" description={selectedService ? `Are you sure you want to delete service "${selectedService.name}"?` : "Are you sure you want to delete this service?"} confirmLabel="Delete" cancelLabel="Cancel" onConfirm={handleDeleteService} />}
        </div>
      </div>
    </>
  );
}
