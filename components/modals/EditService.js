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
import { Textarea } from "@/components/ui/textarea";
import { PriceField } from "@/components/common/PriceField";
import { useFormState } from "@/hooks/useFormState";

export default function EditService() {
  const [editOpen, setEditOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [form, setForm] = useState({
    id: "",
    name: "",
    description: "",
    price: "",
    duration: "",
  });
  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setNewName(category?.name || "");
    setEditOpen(true);
  };
  const handleUpdate = async () => {
    if (!newName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    const formData = new FormData();
    formData.append("name", newName);
    
    const serviceId = selectedService?.id;
    try {
      const res = await fetch(`/api/services/${serviceId}`, {
        method: "PATCH",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Category updated successfully");
        setEditOpen(false);
        const updated = await fetch("/api/categories").then((res) =>
          res.json()
        );
        setCategories(updated);
      } else {
        toast.error(data.error || "failed to update user");
      }
    } catch {
      console.error("Update error", error);
      toast.error("An error occured");
    }
  };
  return (
    <Dialog>
      <form>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
          </DialogHeader>
          <div className="mb-3">
            <Label htmlFor="name">
              Service Name <span className="astrick">*</span>
            </Label>
            <Input id="name" name="name" onChange={handleServiceChange} />
            {formErrors && formErrors.serviceName && (
              <p className="text-sm text-red-500">{formErrors.serviceName}</p>
            )}
          </div>
          <div className="mb-2">
            <Label htmlFor="description">Description</Label>
            <Textarea name="description" onChange={handleServiceChange} />
          </div>
          <div className="grid gap-2 grid-cols-12">
            <div className="col-span-6">
              <PriceField onChange={handleServiceChange} />
              {formErrors && formErrors.price && (
                <p className="text-sm text-red-500">{formErrors.price}</p>
              )}
            </div>
            <div className="col-span-6">
              <Label htmlFor="price">
                Duration <span className="astrick">*</span>
              </Label>
              <div className="flex items-center">
                <Input
                  type="number"
                  id="duration"
                  name="duration"
                  placeholder="Enter duration"
                  onChange={handleServiceChange}
                  className="rounded-r-none"
                />
                <span className="px-3 py-[7px] bg-muted text-muted-foreground rounded-r-md border border-l-0">
                  min
                </span>
              </div>
              {formErrors && formErrors.duration && (
                <p className="text-sm text-red-500">{formErrors.duration}</p>
              )}
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="secondary">Cancel</Button>
            <Button type="submit" onClick={handleAddService}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
