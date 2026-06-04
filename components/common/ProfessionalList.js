import { useState, useEffect, lazy } from "react";
import { TrashIcon, PencilLineIcon, InfoIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { usePathname, useRouter } from "next/navigation";
import Loading from "@/components/common/Loading";
import AddProfessional from "@/components/modals/AddProfessional";
import ConfirmAlert from "@/components/common/ConfirmAlert";
import EditProfessional from "@/components/modals/EditProfessional";
import { useFetch } from "@/hooks/useFetch";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function ProfessionalList({ vendorId, locationId, canManage = false }) {
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
    if (fetchedRoles) {
      setRoles(fetchedRoles);
    }
  }, [fetchedRoles]);

  const pathname = usePathname();
  const router = useRouter();

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

  const professionalLimit = Number(vendor.subscriptionProfessionalLimit || vendor.billingSummary?.professionalCount || vendor.plan?.professional || 1);
  const currentProfessionalCount = Number(vendor.billingSummary?.actualProfessionalCount || vendor.professionals?.length || 0);
  const canAddProfessional = currentProfessionalCount < professionalLimit;

  // show button only if pathname contains "edit-business" or canManage is true
  const showAddButton = canManage || pathname.includes("edit-business");
  const showActionButton = canManage || pathname.includes("edit-business");

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
        const updated = await fetch(`/api/businesses/${vendorId}`).then((res) => res.json());
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
          {canAddProfessional ? (
            <Button onClick={() => setAddProfessionalOpen(true)}>Add Professional</Button>
          ) : (
            <Alert className="max-w-lg border-amber-200 bg-amber-50 text-amber-900">
              <InfoIcon className="text-amber-900 !top-[12px]" />
              <AlertTitle className="mb-0">
                Professional limit reached. Your subscription allows only {professionalLimit} professional{professionalLimit !== 1 ? "s" : ""}.
              </AlertTitle>
            </Alert>
          )}
          {openAddProfessional && (
            <AddProfessional
              open={openAddProfessional}
              setAddProfessionalOpen={setAddProfessionalOpen}
              vendorId={vendorId}
              roles={roles}
              vendor={vendor}
              locationId={locationId || vendor.selectedLocationId}
              onAdded={async () => {
                const updatedVendor = await fetch(locationId ? `/api/businesses/${vendorId}?locationId=${locationId}` : `/api/businesses/${vendorId}`).then((r) => r.json());
                setVendorDetail(updatedVendor);
              }}
            />
          )}
        </>
      )}

      <Table className="mt-3">
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">S.N</TableHead>
            <TableHead className="w-1/2">Professional Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            {showActionButton && <TableHead>Action</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendor.professionals?.length > 0 ? (
            vendor.professionals.map((professional, index) => (
              <TableRow key={professional.id}>
                <TableCell className="text-center">{index + 1}</TableCell>
                <TableCell>
                  <p className="font-semibold">{professional.name}</p>
                  <p className="text-sm text-muted-foreground">{professional.email}</p>
                </TableCell>
                <TableCell>{professional.role?.name}</TableCell>
                <TableCell>{professional.phone}</TableCell>
                <TableCell>{professional.status === "ACTIVE" ? <Badge className="text-green-700 bg-green-200 hover:bg-green-200 uppercase text-[10px]">Active</Badge> : <Badge className="bg-gray-500 hover:bg-gray-500 uppercase text-[10px]">Inactive</Badge>}</TableCell>
                {showActionButton && (
                  <TableCell>
                    <div className="flex gap-2">
                      <button className="text-gray-500 hover:text-gray-700" onClick={() => handleEditProfessionalClick(professional)}>
                        <PencilLineIcon size={20} weight="duotone" />
                      </button>
                      <button className="text-red-500 hover:text-red-700" onClick={() => handleDeleteProfessionalClick(professional)}>
                        <TrashIcon size={20} weight="duotone" />
                      </button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={showActionButton ? 6 : 5} className="text-center py-6 text-muted-foreground">
                No professionals found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {selectedProfessional && (
        <EditProfessional
          openEdit={openEditProfessional}
          setEditProfessionalOpen={setEditProfessionalOpen}
          vendorId={vendorId}
          professional={selectedProfessional}
          roles={roles}
          locationId={locationId || vendor.selectedLocationId}
          onEdited={async () => {
            const updatedVendor = await fetch(locationId ? `/api/businesses/${vendorId}?locationId=${locationId}` : `/api/businesses/${vendorId}`).then((r) => r.json());
            setVendorDetail(updatedVendor);
          }}
        />
      )}
      {openAlert && <ConfirmAlert open={openAlert} onOpenChange={setAlertOpen} title="Delete Professional?" description={selectedProfessional ? `Are you sure you want to delete professional "${selectedProfessional.name}"?` : "Are you sure you want to delete this professional?"} confirmLabel="Delete" cancelLabel="Cancel" onConfirm={handleDeleteProfessional} />}
    </>
  );
}
