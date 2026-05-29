"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateForm } from "@/utils/formValidator";
import { useFormState } from "@/hooks/useFormState";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert,AlertTitle } from "@/components/ui/alert"
import { WarningDiamondIcon } from "@phosphor-icons/react";

import { PROFESSIONAL_STATUS } from "@/constants/enums";
import { useMutation } from "@/hooks/useMutation";

export default function AddProfessional({
  open,
  setAddProfessionalOpen,
  vendorId,
  locationId,
  vendor,
  roles,
  onAdded,
  loading: rolesLoading,
  error: rolesError,
}) {
  const formId = "add-professional-form";
  const [formErrors, setFormErrors] = useState({});
  const [addloading, setAddLoading] = useState(false);
  const [adderror, setAddError] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [openAddProfessionalRole, setAddProfessionalRoleOpen] = useState(false);

  const {
    formState: professionalForm,
    handleChange: handleProfessionalChange,
    resetForm,
  } = useFormState({
    id: "",
    name: "",
    email: "",
    phone: "",
    role: "",
    status: "",
    locationId: locationId || "",
  });

  useEffect(() => {
    if (locationId) {
      handleProfessionalChange({
        target: { name: "locationId", value: locationId },
      });
    }
  }, [locationId]);

  const validationRules = {
    name: { required: true, message: "Name is required" },
    email: { required: true, message: "Email is required" },
    phone: { required: true, message: "Phone is required" },
    role: { required: true, message: "Role is required" },
    status: { required: true, message: "Status is required" },
  };

  const handleAddProfessionalRole = async () => {
    try {
      setAddLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/professional-roles`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newRole }),
        }
      );
      if (!res.ok) throw new Error("Failed to add role");
      const created = await res.json();
      setRoles((prev) => [...prev, created]);
      setAddProfessionalRoleOpen(false);
      setNewRole("");
      toast.success("Role added successfully");
    } catch (err) {
      console.error(err);
    } finally {
      setAddLoading(false);
    }
  };

  const {
    mutate: addProfessional,
    loading: addLoading,
    error: addError,
  } = useMutation(`/api/professionals/create`, { method: "POST" });

  const handleAddProfessional = async (e) => {
    e.preventDefault();
    const errors = validateForm(professionalForm, validationRules);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await addProfessional({ ...professionalForm, locationId: professionalForm.locationId || locationId, vendorId });
      resetForm();
      setAddProfessionalOpen(false);
      toast.success("Professional has been added. Subscription estimate updated.");
      if (onAdded) onAdded();
    } catch (err) {
      toast.error(err.message || "Cannot add professional.");
    }
  };

  return (
    <>
      {/* Add Professional Dialog */}
      <Dialog open={open} onOpenChange={setAddProfessionalOpen}>
        <form id={formId} onSubmit={handleAddProfessional}>
          <DialogContent className="sm:max-w-[650px]">
            <DialogHeader>
              <DialogTitle>Add Professional</DialogTitle>
            </DialogHeader>
            {addError && (
              <Alert variant="destructive" className="flex items-center">
                <WarningDiamondIcon size={20} className="!top-[10px]" />
                <AlertTitle>{addError}</AlertTitle>
              </Alert>
            )}
            {vendor?.plan && (
              <Alert className="flex items-center">
                <AlertTitle>
                  Includes {vendor.plan.professional || 1} professional(s). Extra professionals add {vendor.plan.extraProfessionalPrice || 0} per {vendor.plan.billing_cycle || "month"}.
                </AlertTitle>
              </Alert>
            )}
            <fieldset>
              <div className="mb-3">
                <Label htmlFor="name">
                  Professional Name <span className="astrick">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  onChange={handleProfessionalChange}
                  value={professionalForm.name}
                />
                {formErrors?.name && (
                  <p className="text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>
              <div className="mb-3">
                <Label htmlFor="email">
                  Email <span className="astrick">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  onChange={handleProfessionalChange}
                  value={professionalForm.email}
                />
                {formErrors?.email && (
                  <p className="text-sm text-red-500">{formErrors.email}</p>
                )}
              </div>
              <div className="mb-3">
                <Label htmlFor="phone">
                  Phone <span className="astrick">*</span>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  onChange={handleProfessionalChange}
                  value={professionalForm.phone}
                />
                {formErrors.phone && (
                  <p className="text-sm text-red-500">{formErrors.phone}</p>
                )}
              </div>
              <div className="grid grid-cols-12 gap-3">
                {/* Role */}
                <div className="mb-3 col-span-6">
                  <Label htmlFor="role">
                    Role <span className="astrick">*</span>
                  </Label>
                  <Select
                    value={professionalForm.role}
                    onValueChange={(value) => {
                      if (value === "__add_new__") {
                        setAddProfessionalRoleOpen(true);
                      } else {
                        handleProfessionalChange({
                          target: { name: "role", value },
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {rolesLoading && (
                          <SelectItem disabled>Loading...</SelectItem>
                        )}
                        {rolesError && (
                          <SelectItem disabled>Error loading roles</SelectItem>
                        )}
                        {roles?.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="__add_new__">
                          + Add New Role
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="mb-3 col-span-6">
                  <Label htmlFor="status">
                    Status <span className="astrick">*</span>
                  </Label>
                  <Select
                    value={professionalForm.status}
                    onValueChange={(value) =>
                      handleProfessionalChange({
                        target: { name: "status", value },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {PROFESSIONAL_STATUS.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </fieldset>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setAddProfessionalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form={formId}
                disabled={addLoading}
              >
                {addLoading ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>

      {/* Add New Role Dialog */}
      {openAddProfessionalRole && (
        <Dialog
          open={openAddProfessionalRole}
          onOpenChange={setAddProfessionalRoleOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Role</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Enter role name"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            />
            <DialogFooter>
              <Button
                onClick={() => {
                  resetForm();
                  setAddProfessionalRoleOpen(false);
                }}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddProfessionalRole}
                disabled={!newRole || addloading}
              >
                {addloading ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
