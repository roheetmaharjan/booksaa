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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useFormState } from "@/hooks/useFormState";
import { useMutation } from "@/hooks/useMutation";
import { PROFESSIONAL_STATUS } from "@/constants/enums";
import { validateForm } from "@/utils/formValidator";

export default function EditProfessional({
  openEdit,
  setEditProfessionalOpen,
  professional,
  roles, 
  loading: rolesLoading,
  error: rolesError,
  onEdited
}) {
  const [formErrors, setFormErrors] = useState({});

  const {
    formState: professionalForm,
    handleChange: handleProfessionalChange,
    resetForm,
  } = useFormState({
    id: "",
    name: "",
    email: "",
    role: "",
    phone: "",
    status: "",
  });

  useEffect(() => {
    if (professional) {
      resetForm({
        id: professional.id || "",
        name: professional.name || "",
        email: professional.email || "",
        role: professional.role ? String(professional.role.id) : "",
        status: professional.status || "",
        phone: professional.phone || "",
      });
    }
  }, [professional]);

  // Validation rules
  const validationRules = {
    name: { required: true, message: "Professional name is required" },
    email: { required: true, message: "Email is required" },
    role: { required: true, message: "Role is required" },
    phone: { required: true, message: "Phone number is required" },
    status: { required: true, message: "Status is required" },
  };

  const {
    mutate: editProfessional,
    loading: editLoading,
    error: editError,
  } = useMutation(`/api/professionals/${professional?.id}`, {
    method: "PATCH",
  });

  const handleUpdateProfessional = async (e) => {
    e.preventDefault();

    const errors = validateForm(professionalForm, validationRules);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await editProfessional({
        ...professionalForm,
        roleId : professionalForm.role
      });
      setEditProfessionalOpen(false);
      toast.success("Professional updated successfully");
      resetForm({
        id: "",
        name: "",
        email: "",
        role: "",
        phone: "",
        status: "",
      });
      if (onEdited) onEdited();
    } catch (err) {
      toast.error(err.message || "Failed to update professional");
    }
  };

  return (
    <Dialog open={openEdit} onOpenChange={setEditProfessionalOpen}>
      <form onSubmit={handleUpdateProfessional}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Edit Professional</DialogTitle>
          </DialogHeader>

          <div className="mb-3">
            <Label htmlFor="name">Professional Name <span className="astrick">*</span></Label>
            <Input
              id="name"
              name="name"
              value={professionalForm.name}
              onChange={handleProfessionalChange}
            />
            {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
          </div>

          <div className="mb-3">
            <Label htmlFor="email">Email <span className="astrick">*</span></Label>
            <Input
              id="email"
              name="email"
              value={professionalForm.email}
              onChange={handleProfessionalChange}
            />
            {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
          </div>

          <div className="mb-3">
            <Label htmlFor="phone">Phone <span className="astrick">*</span></Label>
            <Input
              id="phone"
              name="phone"
              value={professionalForm.phone}
              onChange={handleProfessionalChange}
            />
            {formErrors.phone && <p className="text-sm text-red-500">{formErrors.phone}</p>}
          </div>

          <div className="grid grid-cols-12 gap-3">
            <div className="mb-3 col-span-6">
              <Label htmlFor="role">Role <span className="astrick">*</span></Label>
              <Select
                value={professionalForm.role}
                onValueChange={(value) =>
                  handleProfessionalChange({ target: { name: "role", value } })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {rolesLoading && <SelectItem disabled>Loading...</SelectItem>}
                    {rolesError && <SelectItem disabled>Error loading roles</SelectItem>}
                    {roles?.map((role) => (
                      <SelectItem key={role.id} value={String(role.id)}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {formErrors.role && <p className="text-sm text-red-500">{formErrors.role}</p>}
            </div>

            <div className="mb-3 col-span-6">
              <Label htmlFor="status">Status <span className="astrick">*</span></Label>
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
              {formErrors.status && <p className="text-sm text-red-500">{formErrors.status}</p>}
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setEditProfessionalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" onClick={handleUpdateProfessional} disabled={editLoading}>
              {editLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
