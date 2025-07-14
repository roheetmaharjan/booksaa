"use client";
import { UsersLayout } from "@/app/admin/layout";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function VendorsList() {
  const [vendors, setVendors] = useState([]);
  useEffect(() => {
    fetch("/api/vendors")
      .then((res) => res.json())
      .then((data) => setVendors(data))
      .catch((error) => console.error("Failed to fetch users:", error));
  }, []);
  return (
    <UsersLayout>
      <div className="flex flex-row justify-between w-full">
        <h4 className="page-title">Vendors</h4>
        <Dialog>
          <DialogTrigger asChild className="ml-auto">
            <Button>Add Vendors</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Vendors</DialogTitle>
            </DialogHeader>
            {/* <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                  <div className="grid gap-3">
                    <Label htmlFor="firstname">First name</Label>
                    <Input
                      id="firstname"
                      name="firstname"
                      value={form.firstname}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="lastname">Last name</Label>
                    <Input
                      id="lastname"
                      name="lastname"
                      value={form.lastname}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="role">Role</Label>
                    <Select value={form.role} onValueChange={handleRoleChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="VENDOR">Vendor</SelectItem>
                          <SelectItem value="CUSTOMER">Customer</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit">Send Invite</Button>
                </DialogFooter>
              </form> */}
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex">
        <div className="flex">
          <input
            type="search"
            className="bg-gray-50 border rounded focus:border-blue-500"
            placeholder="Search..."
          />
        </div>
        <div className="flex"></div>
      </div>
      <div className="table-responsive">
        <table className="w-full boo-table mt-3 border">
          <thead>
            <tr>
              <th className="text-left text-sm w-16">S.N</th>
              <th className="text-left w-1/3 text-sm">Name</th>
              <th className="text-left text-sm">Location</th>
              <th className="text-left text-sm">Image</th>
              <th className="text-left text-sm">Phone</th>
              <th className="text-left text-sm">Status</th>
              <th className="text-left text-sm">Action</th>
            </tr>
          </thead>
          <tbody>
            {vendors.length === 0 ? (
              <tr>
                <td colSpan="4">Loading...</td>
              </tr>
            ) : (
              vendors.map((vendor, idx) => (
                <tr key={vendor.id} className="border-b">
                  <td className="p-2 text-base text-center">{vendor.id}</td>
                  <td className="p-2 text-base">
                    <div className="font-bold">{vendor.name}</div>
                  </td>
                  <td className="p-2 text-base">
                    <div className="font-bold">{vendor.location}</div>
                  </td>
                  <td>
                    <img src={`${vendor.image}`} alt="" />
                  </td>
                  <td>{vendor.phone}</td>
                  <td>{vendor.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </UsersLayout>
  );
}
