import { useState, useEffect, lazy } from "react";
import { TrashIcon, PencilLineIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { usePathname } from "next/navigation";
import Loading from "@/components/common/Loading";
import AddProfessional from "@/components/modals/AddProfessional";
import ConfirmAlert from "@/components/common/ConfirmAlert";
import EditProfessional from "@/components/modals/EditProfessional";
import { useFetch } from "@/hooks/useFetch";

export default function ProfessionalList({ vendorId }) {
  const [openAddProfessional, setAddProfessionalOpen] = useState(false);
  const [openEditProfessional, setEditProfessionalOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [vendor, setVendorDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openAlert, setAlertOpen] = useState(false);
  const {
    data: fetchedRoles,
    rolesLoading,
    error,
  } = useFetch("/api/professional-roles", {
    lazy: true,
  });

  const [roles, setRoles] = useState([]);
  useEffect(() => {
    if (open && fetchedRoles) {
      setRoles(fetchedRoles);
    }
  }, [open, fetchedRoles]);

  const pathname = usePathname();

  useEffect(() => {
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

  if (loading) return <Loading />;
  if (!vendor) return <p>No vendor found.</p>;

  // show button only if pathname contains "edit-vendor"
  const showAddButton = pathname.includes("edit-business");
  const showActionButton = pathname.includes("edit-business");

  const handleDeleteProfessionalClick = (professional) => {
    setSelectedProfessional(professional);
    setAlertOpen(true);
  };

  const handleEditProfessionalClick = (professional) => {
    setSelectedProfessional(professional);
    setEditProfessionalOpen(true);
  };

  const handleDeleteProfessional = async () => {
    try {
      const res = await fetch(`/api/professionals/${selectedProfessional.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Professional deleted successfully");
        const updated = await fetch(`/api/businesses/${vendorId}`).then((res) =>
          res.json()
        );
        setVendorDetail(updated);
      } else {
        toast.error(data.error || "Failed to delete professional");
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
          <Button onClick={() => setAddProfessionalOpen(true)}>
            Add Professional
          </Button>
          {openAddProfessional && (
            <AddProfessional
              open={openAddProfessional}
              setAddProfessionalOpen={setAddProfessionalOpen}
              vendorId={vendorId}
              roles={roles}
              vendor={vendor}
              onAdded={async () => {
                const updatedVendor = await fetch(
                  `/api/businesses/${vendorId}`
                ).then((r) => r.json());
                setVendorDetail(updatedVendor);
              }}
            />
          )}
        </>
      )}

      <table className="w-full boo-table mt-3 border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left text-sm w-16 px-2 py-1 border-gray-300">
              S.N
            </th>
            <th className="text-left w-1/2 text-sm px-2 py-1 border-gray-300">
              Professional Name
            </th>
            <th className="text-left w-1/5 text-sm px-2 py-1 border-gray-300">
              Role
            </th>
            <th className="text-left w-1/5 text-sm px-2 py-1 border-gray-300">
              Phone
            </th>
            <th className="text-left w-1/5 text-sm px-2 py-1 border-gray-300">
              Status
            </th>
            {showActionButton && (
              <th className="text-left text-sm px-2 py-1 w-1/5">Action</th>
            )}
          </tr>
        </thead>
        <tbody>
          {vendor.professionals && vendor.professionals.length > 0 ? (
            vendor.professionals.map((professional, index) => (
              <tr key={professional.id}>
                <td className="p-2 text-center">{index + 1}</td>
                <td className="p-2">
                  {" "}
                  <h4 className="text-base mb-1 text-bold">
                    {professional.name}
                  </h4>{" "}
                  <p className="text-gray-400">{professional.email}</p>
                </td>
                <td className="p-2">{professional.role.name}</td>
                <td className="p-2">{professional.phone}</td>
                <td className="p-2">
                  {professional.status === "ACTIVE" ? (
                    <Badge
                      variant="default"
                      className="text-green-700 bg-green-200 hover:bg-green-200 uppercase text-[10px]"
                    >
                      Active
                    </Badge>
                  ) : (
                    <Badge
                      variant="default"
                      className="bg-gray-500 hover:bg-gray-500"
                    >
                      Inactive
                    </Badge>
                  )}
                </td>
                {showActionButton && (
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button
                        className="text-gray-500"
                        onClick={() =>
                          handleEditProfessionalClick(professional)
                        }
                      >
                        <PencilLineIcon size={20} weight="duotone" />
                      </button>
                      <button
                        className="text-red-500"
                        onClick={() =>
                          handleDeleteProfessionalClick(professional)
                        }
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
                No professional found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {selectedProfessional && (
        <EditProfessional
          openEdit={openEditProfessional}
          setEditProfessionalOpen={setEditProfessionalOpen}
          vendorId={vendorId}
          professional={selectedProfessional}
          roles={roles}
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
          title="Delete Professional?"
          description={
            selectedProfessional
              ? `Are you sure you want to delete professional "${selectedProfessional.name}"?`
              : "Are you sure you want to delete this professional?"
          }
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleDeleteProfessional}
        />
      )}
    </>
  );
}
