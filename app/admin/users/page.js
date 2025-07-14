"use client";
import { UsersLayout } from "./../layout";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    role: "",
  });
  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error("Failed to fetch users:", error));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (value) => {
    setForm({ ...form, role: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("/api/users/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
  };

  return (
    <UsersLayout>
        <div className="flex flex-row justify-between w-full">
          <h4 className="page-title">Users List</h4>
          <Dialog>
            <DialogTrigger asChild className="ml-auto">
              <Button>Invite User</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Invite User</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
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
              </form>
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
                <th className="text-sm w-16">S.N</th>
                <th className="text-left w-1/3 text-sm">Name</th>
                <th className="text-left w-52 text-sm">Joined Date</th>
                <th className="text-left w-52 text-sm">Role</th>
                <th className="text-left text-sm">Status</th>
                <th className="text-left text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5">Loading...</td>
                </tr>
              ) : (
                users.map((user, idx) => (
                  <tr key={user.id} className="border-b">
                    <td className="py-2 text-base text-center">{idx + 1}</td>
                    <td className="py-2 text-base">
                      <div className="font-bold">
                        {`${user.firstname} ` + `${user.lastname}`}
                      </div>
                      <div className="text-gray-600">{user.email}</div>
                    </td>
                    <td className="py-2 text-base">{user.joinedAt}</td>
                    <td className="py-2 text-base">{user.role}</td>
                    <td className="py-2 text-base">
                      {user.status === "ACTIVE" ? (
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
    </UsersLayout>
  );
}
