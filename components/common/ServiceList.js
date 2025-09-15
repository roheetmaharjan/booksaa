import { useState, useEffect, useRef } from "react";
import AddService from "@/components/modals/AddService";
import EditService from "@/components/modals/EditService";
import ConfirmAlert from "@/components/common/ConfirmAlert";
import { TrashIcon, PencilLineIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { usePathname } from "next/navigation";

export default function ServiceList({ vendorId }) {
  const [openAddService, setAddServiceOpen] = useState(false);
  const [openEditService, setEditServiceOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null); 
  const [vendor, setVendorDetail] = useState(null);
  const [openAlert, setAlertOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    if (!vendorId) return;
    setLoading(true);
    fetch(`/api/businesses/${vendorId}`)
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

  // show button only if pathname contains "edit-business"
  const showAddButton = pathname.includes("edit-business");
  const showActionButton = pathname.includes("edit-business");

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
        const updated = await fetch(`/api/businesses/${vendorId}`).then((res) =>
          res.json()
        );
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
      {showAddButton && (
        <>
          <Button onClick={() => setAddServiceOpen(true)}>Add Service</Button>
          <AddService
            open={openAddService}
            setAddServiceOpen={setAddServiceOpen}
            vendorId={vendorId}
            onAdded={async () => {
              const updatedVendor = await fetch(
                `/api/businesses/${vendorId}`
              ).then((r) => r.json());
              setVendorDetail(updatedVendor);
            }}
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
            <th className="text-left w-1/3 text-sm px-2 py-1 border-gray-300">
              Description
            </th>
            <th className="text-left w-1/5 text-sm px-2 py-1 border-gray-300">
              Price
            </th>
            <th className="text-left w-1/2 text-sm px-2 py-1 border-gray-300">
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
              <tr key={service.id}>
                <td className="p-2 text-center">{index + 1}</td>
                <td className="p-2">{service.name}</td>
                <td className="p-2">{service.description || "-"}</td>
                <td className="p-2">{service.price}</td>
                <td className="p-2">{service.duration} min</td>
                {showActionButton && (
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button
                        className="text-gray-500"
                        onClick={() => handleEditServiceClick(service)}
                      >
                        <PencilLineIcon size={20} weight="duotone" />
                      </button>
                      <button
                        className="text-red-500"
                        onClick={() => handleDeleteServiceClick(service)}
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

      {selectedService && (
        <EditService
          openEdit={openEditService}
          setEditServiceOpen={setEditServiceOpen}
          vendorId={vendorId}
          service={selectedService}
          onEdited={async () => {
            const updatedVendor = await fetch(
              `/api/businesses/${vendorId}`
            ).then((r) => r.json());
            setVendorDetail(updatedVendor);
          }}
        />
      )}
      {openAlert && (
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
          onConfirm={handleDeleteService}
        />
      )}
    </>
  );
}
