"use client";
import { UsersLayout } from "@/app/admin/layout";
import Loading from "@/components/common/Loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { validateForm } from "@/utils/formValidator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import ServiceList from "@/components/common/ServiceList";


export default function EditVendor() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState({
    user: {
      firstname: "",
      lastname: "",
      email: "",
    },
    name: "",
    phone: "",
    location: "",
    planId: "",
    categoryId: "",
    status: "",
    image: "",
  });
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [plans, setPlans] = useState([]);
  const validationRules = {
    "user.firstname": { required: true, message: "First name is required" },
    "user.lastname": { required: true, message: "Last name is required" },
    "user.email": {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Valid email is required",
    },
    name: { required: true, message: "Business name is required" },
    categoryId: { required: true, message: "Category is required" },
    planId: { required: true, message: "Plan is required" },
    
  };
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data.categories || data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
      }
    };
    const fetchPlans = async () => {
      try {
        const res = await fetch("/api/plans");
        if (!res.ok) throw new Error("Failed to fetch plans");
        const data = await res.json();
        setPlans(data.plans || data);
      } catch (error) {
        console.error("failed to fetch plans: ", error);
        setPlans([]);
      }
    };
    fetchPlans();
    fetchCategories();
    fetch(`/api/vendors/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setForm(data);
        setLoading(false);
      })
      .catch((err) => {
        setForm(null);
        setLoading(false);
        toast.error(err.message);
      });
  }, [id]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["firstname", "lastname", "email"].includes(name)) {
      setForm((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          [name]: value,
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  const handleDetailSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(form, validationRules);
    setFormErrors(errors);
    console.log(errors);

    if (Object.keys(errors).length > 0) return;
    const res = await fetch(`/api/vendors/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Vendor updated successfully!");
      router.push("/admin/vendors");
    } else {
      toast.error("failed to update vendor");
    }
  };

  return (
    <UsersLayout>
      <div className="flex flex-row justify-between w-full items-center mb-4">
        <h4 className="page-title">Edit Vendor</h4>
      </div>
      {loading ? (
        <Loading />
      ) : !form ? (
        <div>Vendor not found</div>
      ) : (
        <>
          <Tabs defaultValue="detail" className="gap-2 items-start">
            <TabsList className="h-auto bg-transparent">
              <TabsTrigger className="block w-full text-left" value="detail">
                Detail
              </TabsTrigger>
              <TabsTrigger className="block w-full text-left" value="services">
                Services
              </TabsTrigger>
              <TabsTrigger
                className="block w-full text-left"
                value="professionals"
              >
                Professionals
              </TabsTrigger>
              <TabsTrigger className="block w-full text-left" value="photos">
                Photos
              </TabsTrigger>
              <TabsTrigger className="block w-full text-left" value="reviews">
                Reviews
              </TabsTrigger>
              <TabsTrigger
                className="block w-full text-left"
                value="businesshours"
              >
                Business Hours
              </TabsTrigger>
              <TabsTrigger className="block w-full text-left" value="location">
                Location
              </TabsTrigger>
            </TabsList>
            <div className="px-3">
              <TabsContent value="detail">
                <form onSubmit={handleDetailSubmit}>
                  <div className="max-w-2xl">
                    <div className="flex gap-2 items-center mb-3 justify-start">
                      <figure>
                        {form.image ? (
                          <img
                            src={form.image}
                            alt={`${form.name} Image`}
                            className="h-10 w-10 object-cover rounded"
                          />
                        ) : (
                          <span className="w-24 h-24 bg-primary/10 uppercase flex items-center justify-center rounded-md text-3xl font-bold border border-primary">
                            {form.name?.charAt(0)}
                          </span>
                        )}
                      </figure>
                      <Button variant="outline">Change Image</Button>
                    </div>
                    <div className="mb-2">
                      <Label htmlFor="name">
                        Business Name <span className="astrick">*</span>
                      </Label>
                      <Input
                        name="name"
                        value={form.name || ""}
                        onChange={handleChange}
                        placeholder="Business Name"
                      />
                      {formErrors && formErrors.name && (
                        <p className="text-sm text-red-500">
                          {formErrors.name}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-12 mb-2 gap-2">
                      <div className="col-span-6 mb-2">
                        <Label htmlFor="categoryId">
                          Category <span className="astrick">*</span>
                        </Label>
                        <Select
                          id="categoryId"
                          name="categoryId"
                          value={form.categoryId}
                          onValueChange={(value) =>
                            setForm((prev) => ({ ...prev, categoryId: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.length === 0 ? (
                              <SelectItem key="No-category" value="No-Category">
                                No categories found. Please add one to get
                                started.
                              </SelectItem>
                            ) : (
                              categories.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id}
                                >
                                  {category.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {formErrors && formErrors.categoryId && (
                          <p className="text-sm text-red-500">
                            {formErrors.categoryId}
                          </p>
                        )}
                      </div>
                      <div className="col-span-6 mb-2">
                        <Label htmlFor="planId">
                          Plan <span className="astrick">*</span>
                        </Label>
                        <Select
                          id="planId"
                          name="planId"
                          value={form.planId}
                          onValueChange={(value) =>
                            setForm((prev) => ({ ...prev, planId: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Plans"></SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {plans.length === 0 ? (
                              <SelectItem key="no-plans" value="no-plans">
                                No plans found. Please add one to get started.
                              </SelectItem>
                            ) : (
                              plans.map((plan) => (
                                <SelectItem key={plan.id} value={plan.id}>
                                  {plan.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {formErrors && formErrors.planId && (
                          <p className="text-sm text-red-500">
                            {formErrors.planId}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mb-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        name="phone"
                        value={form.phone || ""}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="mb-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        name="description"
                        value={form.description || ""}
                        onChange={handleChange}
                      />
                    </div>
                    <hr />
                    <div className="border p-4">
                      <h4 className="font-bold mb-3 text-base">
                        User Information
                      </h4>
                      <div className="mb-2">
                        <Label htmlFor="firstname">
                          Email <span className="astrick">*</span>
                        </Label>
                        <Input
                          name="email"
                          value={form.user.email || ""}
                          onChange={handleChange}
                          placeholder="Email"
                          disabled
                        />
                      </div>
                      <div className="grid grid-cols-12 mb-2 gap-2">
                        <div className="col-span-6">
                          <Label htmlFor="firstname">
                            Firstname <span className="astrick">*</span>
                          </Label>
                          <Input
                            name="firstname"
                            value={form.user.firstname || ""}
                            onChange={handleChange}
                            placeholder="Firstname"
                          />
                          {formErrors && formErrors["user.firstname"] && (
                            <p className="text-sm text-red-500">
                              {formErrors["user.firstname"]}
                            </p>
                          )}
                        </div>
                        <div className="col-span-6">
                          <Label htmlFor="lastname">
                            Lastname <span className="astrick">*</span>
                          </Label>
                          <Input
                            name="lastname"
                            value={form.user.lastname || ""}
                            onChange={handleChange}
                            placeholder="Lastname"
                          />
                          {formErrors && formErrors["user.lastname"] && (
                            <p className="text-sm text-red-500">
                              {formErrors["user.lastname"]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <hr />
                    <div className="py-2">
                      <Button onClick={handleDetailSubmit}>Save</Button>
                    </div>
                  </div>
                </form>
              </TabsContent>
              <TabsContent value="services">
                <ServiceList vendorId={form.id}/>
              </TabsContent>
              <TabsContent value="location">
                {form.location ? (
                  <p>{form.address}</p>
                ) : (
                  <div className="flex gap-2 flex-col border rounded py-6 justify-center items-center">
                    <h4 className="font-bold text-lg">No Location added</h4>
                    <p className="text-base">
                      You havent added a location yet.
                    </p>
                    <Button onClick={() => setLocationOpen(true)}>
                      Set on map
                    </Button>
                  </div>
                )}
                {/* <Map/> */}
              </TabsContent>
              <TabsContent value="businesshours">
                this is business hours
              </TabsContent>
              <TabsContent value="professionals">Coming Soon</TabsContent>
              <TabsContent value="photos">Coming Soon</TabsContent>
              <TabsContent value="reviews">Review Comming Soon</TabsContent>
            </div>
          </Tabs>
        </>
      )}
    </UsersLayout>
  );
}
