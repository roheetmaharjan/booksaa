"use client";

import { UsersLayout } from "@/app/admin/layout";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import AddVendor from "@/components/modals/AddVendor";

export default function VendorsList() {
  const [vendors, setVendors] = useState([]);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await fetch("/api/vendors");
        if (!res.ok) throw new Error("Failed to fetch vendors");
        const data = await res.json();
        setVendors(data.vendors || data);
      } catch (error) {
        console.error("Failed to fetch vendors:", error);
        setVendors([]);
      }
    };

    if (!addOpen) {
      fetchVendors();
    }
  }, [addOpen]);

  return (
    <UsersLayout>
      <div className="flex flex-row justify-between w-full items-center mb-4">
        <h4 className="page-title">Vendors</h4>
        <Button onClick={() => setAddOpen(true)}>Add Vendor</Button>
        <AddVendor open={addOpen} setAddOpen={setAddOpen} />
      </div>

      <div className="mb-4">
        <input
          type="search"
          className="bg-gray-50 border rounded px-3 py-2 w-full max-w-sm"
          placeholder="Search vendors..."
          // You can implement search/filter functionality here if you want
        />
      </div>

      <div className="table-responsive">
        <table className="w-full boo-table mt-3 border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left text-sm w-16 px-2 py-1 border-gray-300">S.N</th>
              <th className="text-left text-sm px-2 py-1 border-gray-300">Image</th>
              <th className="text-left w-1/3 text-sm px-2 py-1 border-gray-300">Vendor Name</th>
              <th className="text-left w-1/3 text-sm px-2 py-1 border-gray-300">Name</th>
              <th className="text-left text-sm px-2 py-1 border-gray-300">Location</th>
              <th className="text-left text-sm px-2 py-1 border-gray-300">Phone</th>
              <th className="text-left text-sm px-2 py-1 border-gray-300">Status</th>
            </tr>
          </thead>
          <tbody>
            {vendors.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-600">
                  No vendors found.
                </td>
              </tr>
            ) : (
              vendors.map((vendor, idx) => (
                <tr key={vendor.id || idx} className="border-b border-gray-300">
                  <td className="p-2 text-center">{idx + 1}</td>
                  <td className="p-2">
                    {vendor.image ? (
                      <img
                        src={vendor.image}
                        alt={`${vendor.name} Image`}
                        className="h-10 w-10 object-cover rounded"
                      />
                    ) : (
                      <span className="text-gray-400">No Image</span>
                    )}
                  </td>
                  <td className="p-2 font-semibold">{vendor.name || "N/A"}</td>
                  <td>
                    <h5 className="font-semibold">{`${vendor.user.firstname} ${vendor.user.lastname }`}</h5>
                    <p>{vendor.user.email || "-"}</p>
                  </td>
                  <td className="p-2">{vendor.location || "-"}</td>
                  <td className="p-2">{vendor.phone || "-"}</td>
                  <td className="p-2">{vendor.status || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </UsersLayout>
  );
}
