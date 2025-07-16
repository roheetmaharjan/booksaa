"use client";
import { UsersLayout } from "@/app/admin/layout";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import AddVendor from "@/components/modals/AddVendor"


export default function VendorsList() {
  const [vendors, setVendors] = useState([]);
  const [addOpen,setAddOpen] = useState(false)
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
          <Button className="ml-auto" onClick={() => setAddOpen(true)}>
            Add Vendors
          </Button>
          <AddVendor open={addOpen}  setAddOpen={setAddOpen}/>
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
              <th className="text-left text-sm w-16 px-2">S.N</th>
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
                <td colSpan="7" className="p-2 text-center">You dont have any vendors</td>
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
