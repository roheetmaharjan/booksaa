import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AddVendor({ open, setAddOpen }) {
  const [form, setForm] = useState({
    id: "",
    name:"",
    planId:"",
    status:"",
  });
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleStatusChange = (e) => {
    setForm({ ...form, status: value });
  };
  const handlePlanChange = (e) => {
    setForm({ ...form, plan: value });
  };
  const handleCategoryChange = (e) =>{
    setForm({...form, category: value})
  }
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submit here
    onClose(); // Close the modal after submit
  };
  return (
    <Dialog onOpenChange={setAddOpen} open={open}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader className="mb-2 pb-2">
          <DialogTitle>Add Vendors</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name">Name <span className="astrick">*</span></Label>
              <Input
                Placeholder="Enter Vendor Name"
                id="Name"
                name="name"
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="email">Email <span className="astrick">*</span></Label>
              <Input
                placeholder="example@gmail.com"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="plan">
                Plan <span className="astrick">*</span>
              </Label>
                <Select value={form.plan} onValueChange={handlePlanChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="TRIAL_ACTIVE">Trial</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="category">Category <span className="astrick">*</span></Label>
              <Select value={form.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {/* <SelectItem value="TRIAL_ACTIVE">Trial</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem> */}
                    </SelectGroup>
                  </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="trial">
                  Trial Period <span className="astrick">*</span>
                </Label>
                <Input
                  id="trial"
                  name="trial"
                  value={form.trial}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="plan">
                  Status <span className="astrick">*</span>
                </Label>
                <Select value={form.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="TRIAL_ACTIVE">Trial</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-2 pt-2">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Add</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
