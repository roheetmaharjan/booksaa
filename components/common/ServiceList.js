"use client";

import AddService from "@/components/modals/AddService";
import { TrashIcon, PencilLineIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import ConfirmAlert from "@/components/common/ConfirmAlert";

export default function ServiceList({ vendorId }) {
  const [openAddService, setAddServiceOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [vendor, setVendorDetail] = useState(null);
  const [openAlert, setAlertOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();

  useEffect(() => {
    if (!vendorId) return;
    setLoading(true);
    fetch(`/api/vendors/${vendorId}`)
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
  }, [vendorId]);

  if (loading) return <p>Loading...</p>;
  if (!vendor) return <p>No vendor found.</p>;

  // show button only if pathname contains "edit-vendor"
  const showAddButton = pathname.includes("edit-vendor");
  const showActionButton = pathname.includes("edit-vendor");

  const handleDeleteServiceClick = (serviceId) => {
    setSelectedServiceId(serviceId);
    setAlertOpen(true);
  };
  const handleDeleteService = async (selectedServiceId) => {
    console.log("deleting service",selectedServiceId)
    try {
      const res = await fetch(`/api/services/${selectedServiceId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("service deleted successfully");
        const updated = await fetch(`/api/vendors/${vendorId}`).then((res) =>
          res.json()
        );
        setVendorDetail(updated);
      } else {
        toast.error(data.error || "failed to delete user");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("An error occured");
    }
  };

  const selectedService = vendor.services?.find((service) => service.id === selectedServiceId);

  return (
    <>
      {showAddButton && (
        <>
          <Button onClick={() => setAddServiceOpen(true)}>Add Service</Button>
          <AddService
            open={openAddService}
            setAddServiceOpen={setAddServiceOpen}
            vendorId={vendorId}
          />
        </>
      )}

      <table className="w-full boo-table mt-3 border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left text-sm w-16 px-2 py-1 border-gray-300">
              S.N
            </th>
            <th className="text-left w-1/5 text-sm px-2 py-1 border-gray-300">
              Service Name
            </th>
            <th className="text-left w-full text-sm px-2 py-1 border-gray-300">
              Description
            </th>
            <th className="text-left w-1/5 text-sm px-2 py-1 border-gray-300">
              Price
            </th>
            <th className="text-left w-52 text-sm px-2 py-1 border-gray-300">
              Duration (min)
            </th>
            {showActionButton && (
              <th className="text-left text-sm px-2 py-1 w-1/5">Action</th>
            )}
          </tr>
        </thead>
        <tbody>
          {vendor.services && vendor.services.length > 0 ? (
            vendor.services.map((service, index) => (
              <tr key={index}>
                <td className="p-2 text-center">{index + 1}</td>
                <td className="p-2">{service.name}</td>
                <td className="p-2">{service.description || "-"}</td>
                <td className="p-2">{service.price}</td>
                <td className="p-2">{service.duration} min</td>
                {showActionButton && (
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button className="text-gray-500">
                        <PencilLineIcon size={20} weight="duotone" />
                      </button>
                      <button
                        className="text-red-500"
                        onClick={() => handleDeleteServiceClick(service.id)}
                      >
                        <TrashIcon size={20} weight="duotone" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center py-2">
                No services found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <ConfirmAlert
        open={openAlert}
        onOpenChange={setAlertOpen}
        title="Delete Service?"
        description={
          selectedService
            ? `Are you sure you want to delete service "${selectedService.name}"?`
            : "Are you sure you want to delete this service?"
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={() => {
          handleDeleteService(selectedServiceId);
        }}
      />
    </>
  );
}
