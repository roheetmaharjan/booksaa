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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  onRoleAdded,   // ← new: called with the created role so parent can update its list
  onAdded,
  loading: rolesLoading,
  error: rolesError,
}) {
  const formId = "add-professional-form";
  const [formErrors, setFormErrors] = useState({});
  const [roleLoading, setRoleLoading] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [openAddProfessionalRole, setAddProfessionalRoleOpen] = useState(false);

  const professionalLimit = Number(
    vendor?.subscriptionProfessionalLimit ??
    vendor?.billingSummary?.professionalCount ??
    vendor?.plan?.professional ??
    0
  );
  const currentProfessionalCount = Number(
    vendor?.billingSummary?.actualProfessionalCount ??
    vendor?.professionals?.length ??
    0
  );
  const professionalLimitReached =
    professionalLimit > 0 && currentProfessionalCount >= professionalLimit;

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

  const {
    mutate: addProfessional,
    loading: addLoading,
    error: addError,
  } = useMutation(`/api/professionals/create`, { method: "POST" });

  // ── Add new role ──────────────────────────────────────────────────────────
  const handleAddProfessionalRole = async () => {
    if (!newRole.trim()) return;
    try {
      setRoleLoading(true);
      const res = await fetch(`/api/professional-roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRole.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to add role");
      }
      const created = await res.json();
      if (onRoleAdded) onRoleAdded(created);  // let parent update roles list
      setAddProfessionalRoleOpen(false);
      setNewRole("");
      toast.success("Role added successfully");
    } catch (err) {
      toast.error(err.message || "Failed to add role");
    } finally {
      setRoleLoading(false);
    }
  };

  // ── Add professional ──────────────────────────────────────────────────────
  const handleAddProfessional = async (e) => {
    e.preventDefault();

    if (professionalLimitReached) {
      toast.error(
        `Professional limit reached. Your subscription allows ${professionalLimit} professional${professionalLimit !== 1 ? "s" : ""}.`
      );
      return;
    }

    const errors = validateForm(professionalForm, validationRules);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await addProfessional({
        ...professionalForm,
        locationId: professionalForm.locationId || locationId,
        vendorId,
      });
      resetForm();
      setAddProfessionalOpen(false);
      toast.success("Professional added. Subscription estimate updated.");
      if (onAdded) onAdded();
    } catch (err) {
      toast.error(err.message || "Cannot add professional.");
    }
  };

  return (
    <>
      {/* ── Add Professional Dialog ── */}
      <Dialog open={open} onOpenChange={setAddProfessionalOpen}>
        <form id={formId} onSubmit={handleAddProfessional}>
          <DialogContent className="sm:max-w-[650px]">
            <DialogHeader>
              <DialogTitle>Add Professional</DialogTitle>
            </DialogHeader>

            {addError && (
              <Alert variant="destructive" className="flex items-center gap-2">
                <WarningDiamondIcon size={20} />
                <AlertTitle>{addError}</AlertTitle>
              </Alert>
            )}

            {professionalLimitReached && (
              <Alert variant="destructive" className="flex items-center gap-2">
                <WarningDiamondIcon size={20} />
                <div>
                  <AlertTitle>Professional limit reached</AlertTitle>
                  <AlertDescription>
                    Your subscription allows {professionalLimit} professional{professionalLimit !== 1 ? "s" : ""}.
                    Add an add-on or update your subscription before adding another professional.
                  </AlertDescription>
                </div>
              </Alert>
            )}

            <fieldset disabled={professionalLimitReached}>
              <div className="mb-3">
                <Label htmlFor="name">
                  Professional Name <span className="astrick">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={professionalForm.name}
                  onChange={handleProfessionalChange}
                />
                {formErrors.name && (
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
                  value={professionalForm.email}
                  onChange={handleProfessionalChange}
                />
                {formErrors.email && (
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
                  value={professionalForm.phone}
                  onChange={handleProfessionalChange}
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
                        handleProfessionalChange({ target: { name: "role", value } });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {rolesLoading && (
                          <SelectItem value="__loading__" disabled>Loading...</SelectItem>
                        )}
                        {rolesError && (
                          <SelectItem value="__error__" disabled>Error loading roles</SelectItem>
                        )}
                        {roles?.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="__add_new__">+ Add New Role</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {formErrors.role && (
                    <p className="text-sm text-red-500">{formErrors.role}</p>
                  )}
                </div>

                {/* Status */}
                <div className="mb-3 col-span-6">
                  <Label htmlFor="status">
                    Status <span className="astrick">*</span>
                  </Label>
                  <Select
                    value={professionalForm.status}
                    onValueChange={(value) =>
                      handleProfessionalChange({ target: { name: "status", value } })
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
                  {formErrors.status && (
                    <p className="text-sm text-red-500">{formErrors.status}</p>
                  )}
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
                disabled={addLoading || professionalLimitReached}
              >
                {addLoading ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>

      {/* ── Add New Role Dialog ── */}
      <Dialog open={openAddProfessionalRole} onOpenChange={setAddProfessionalRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Role</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Enter role name"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddProfessionalRole()}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setAddProfessionalRoleOpen(false);
                setNewRole("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddProfessionalRole}
              disabled={!newRole.trim() || roleLoading}
            >
              {roleLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}