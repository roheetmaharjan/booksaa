"use client"
import { SettingsLayout } from "@/app/admin/layout";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddPlans from "@/components/modals/AddPlan";
import { toast } from "sonner";

export default function Plan() {
  const [plans, setPlans] = useState([]);
  const [openAdd, setAdd] = useState(false);
  const [savingPlanId, setSavingPlanId] = useState("");
  const fetchPlans = () => {
    fetch("/api/plans")
      .then((res) => res.json())
      .then((data) =>
        setPlans(
          data.map((plan) => ({
            ...plan,
            price: plan.price ?? 0,
            professional: plan.professional ?? 1,
            location: plan.location ?? 1,
            extraProfessionalPrice: plan.extraProfessionalPrice ?? 0,
            extraLocationPrice: plan.extraLocationPrice ?? 0,
          }))
        )
      )
      .catch((error) => console.error("Failed to fetch plans:", error));
  };

  useEffect(() => {
    fetchPlans();
  }, [openAdd]);

  const updatePlanField = (planId, field, value) => {
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === planId ? { ...plan, [field]: value } : plan
      )
    );
  };

  const savePlan = async (plan) => {
    try {
      setSavingPlanId(plan.id);
      const res = await fetch(`/api/plans/${plan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: plan.price,
          professional: plan.professional,
          location: plan.location,
          extraProfessionalPrice: plan.extraProfessionalPrice,
          extraLocationPrice: plan.extraLocationPrice,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update plan");
      toast.success("Plan pricing updated.");
      fetchPlans();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSavingPlanId("");
    }
  };

  return (
    <SettingsLayout>
      <div className="flex flex-row justify-between w-full">
        <h4 className="page-title">Plans</h4>
        <Button className="ml-auto" onClick={() => setAdd(true)}>
          Add Plan
        </Button>
        <AddPlans open={openAdd} setAdd={setAdd} />
      </div>
      <div className="table-responsive">
        <table className="w-full boo-table mt-3 border">
          <thead>
            <tr>
              <th className="text-sm w-16">S.N</th>
              <th className="text-left w-1/4 text-sm">Name</th>
              <th className="text-left w-40 text-sm">Price</th>
              <th className="text-left w-40 text-sm">Billing Cycle</th>
              <th className="text-left w-40 text-sm">Trial Period</th>
              <th className="text-left w-40 text-sm">Duration</th>
              <th className="text-left w-1/6 text-sm">Enrolled Vendors</th>
              <th className="text-left w-40 text-sm">Included</th>
              <th className="text-left w-48 text-sm">Add-on Pricing</th>
              <th className="text-left w-24 text-sm">Action</th>
            </tr>
          </thead>
          <tbody>
            {plans.length === 0 ? (
              <tr>
                <td colSpan="10" align="center" className="p-2">
                  No any plan found
                </td>
              </tr>
            ) : (
              plans.map((plan, idx) => (
                <tr key={plan.id} className="border-b">
                  <td className="p-2 text-base text-center">{idx + 1}</td>
                  <td className="p-2 text-base">
                    <h4 className="font-bold">{plan.name}</h4>
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={plan.price ?? 0}
                      onChange={(event) =>
                        updatePlanField(plan.id, "price", event.target.value)
                      }
                      className="w-28"
                    />
                  </td>
                  <td>
                    {plan.billing_cycle}
                  </td>
                  <td>{plan.trial_period}</td>
                  <td>{plan.duration}</td>
                  <td>{plan._count?.vendors || 0}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min={1}
                        value={plan.professional ?? 1}
                        onChange={(event) =>
                          updatePlanField(plan.id, "professional", event.target.value)
                        }
                        className="w-20"
                        aria-label="Included professionals"
                      />
                      <Input
                        type="number"
                        min={1}
                        value={plan.location ?? 1}
                        onChange={(event) =>
                          updatePlanField(plan.id, "location", event.target.value)
                        }
                        className="w-20"
                        aria-label="Included locations"
                      />
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={plan.extraProfessionalPrice ?? 0}
                        onChange={(event) =>
                          updatePlanField(plan.id, "extraProfessionalPrice", event.target.value)
                        }
                        className="w-24"
                        aria-label="Extra professional price"
                      />
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={plan.extraLocationPrice ?? 0}
                        onChange={(event) =>
                          updatePlanField(plan.id, "extraLocationPrice", event.target.value)
                        }
                        className="w-24"
                        aria-label="Extra location price"
                      />
                    </div>
                  </td>
                  <td>
                    <Button
                      size="sm"
                      onClick={() => savePlan(plan)}
                      disabled={savingPlanId === plan.id}
                    >
                      {savingPlanId === plan.id ? "Saving..." : "Save"}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </SettingsLayout>
  );
}
