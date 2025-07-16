"use client"
import { SettingsLayout } from "@/app/admin/layout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Plan() {
  const [plans, setPlans] = useState([]);
  const [openAdd, setAdd] = useState(false);
  useEffect(() => {
    fetch("/api/plans")
      .then((res) => res.json())
      .then((data) => setPlans(data))
      .catch((error) => console.error("Failed to fetch plans:", error));
  }, []);
  return (
    <SettingsLayout>
      <div className="flex flex-row justify-between w-full">
        <h4 className="page-title">Plans</h4>
        <Button className="ml-auto" onClick={() => setAdd(true)}>
          Add Plan
        </Button>
      </div>
      <div className="table-responsive">
        <table className="w-full boo-table mt-3 border">
          <thead>
            <tr>
              <th className="text-sm w-16">S.N</th>
              <th className="text-left w-1/4 text-sm">Name</th>
              <th className="text-left w-40 text-sm">Price</th>
              <th className="text-left w-40 text-sm">Expiry Date</th>
              <th className="text-left w-40 text-sm">Trial Period</th>
              <th className="text-left w-1/5 text-sm">Enrolled Vendors</th>
              <th className="text-left text-sm">Action</th>
            </tr>
          </thead>
          <tbody>
            {plans.length === 0 ? (
              <tr>
                <td colSpan="6" align="center" className="p-2">
                  No any plan found
                </td>
              </tr>
            ) : (
              plans.map((plan, idx) => (
                <tr key={plan.id} className="border-b">
                  <td className="p-2 text-base text-center">{idx + 1}</td>
                  <td className="p-2 text-base">
                    <div className="font-bold">{plan.name}</div>
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  {/* <td>
                                <div className="flex gap-1">
                                  <Button
                                    className="py-0 bg-primary"
                                    onClick={() => handleEditClick(category)}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    className="py-0 bg-red-200 text-red-500 hover:bg-red-300"
                                    onClick={() => handleDelete(category.id)}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </td> */}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </SettingsLayout>
  );
}
