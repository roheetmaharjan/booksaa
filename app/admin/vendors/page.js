import { UsersLayout } from "../layout";
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

export default function VendorsList() {
  return (
    <UsersLayout>
      <div className="container-fluid">
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
      </div>
    </UsersLayout>
  );
}
