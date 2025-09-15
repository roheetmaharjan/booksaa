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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import ServiceList from "@/components/common/ServiceList";
import ProfessionalList from "@/components/common/ProfessionalList";
import BusinessHours from "@/components/common/BusinessHour";
import { useFormState } from "@/hooks/useFormState";
import AddLocation from "@/components/modals/AddLocation";
import { CameraIcon } from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    joinedAt: "",
    cancellation_policy: "",
    trialEndsAt: "",
  });
  const [loading, setLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [plans, setPlans] = useState([]);
  const [openAddLocation, setAddLocationOpen] = useState(false);
  const validationRules = {
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
    fetch(`/api/businesses/${id}`)
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
    if (["firstname", "lastname"].includes(name)) {
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
  // const { formState, handleChange, resetForm } = useFormState(form);
  const handleResend = async (vendorId) => {
    try {
      const res = await fetch("/api/resend-activation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to resend activation link");
      }

      toast.success(data.message);
    } catch (error) {
      console.error("Resend failed:", error);
      toast.error(error.message);
    }
  };
  const handleDetailSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(form, validationRules);
    setFormErrors(errors);
    console.log(errors);

    if (Object.keys(errors).length > 0) return;
    const res = await fetch(`/api/businesses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Vendor updated successfully!");
      router.push("/admin/businesses");
    } else {
      toast.error("failed to update vendor");
    }
  };

  return (
    <UsersLayout>
      <div className="flex flex-row justify-between w-full items-center mb-4">
        <h4 className="page-title">Edit Business</h4>
      </div>
      {loading ? (
        <Loading />
      ) : !form ? (
        <div>Business not found</div>
      ) : (
        <>
          <div className="flex gap-5 items-center mb-7 justify-start">
            <div className="relative">
              {form.image ? (
                <figure className="w-32 h-32 object-cover rounded-md">
                  <img
                    src={form.image}
                    alt={`${form.name} Image`}
                    className="h-10 w-10 object-cover rounded"
                  />
                </figure>
              ) : (
                <span className="w-32 h-32 bg-primary/10 uppercase flex items-center justify-center rounded-md text-3xl font-bold border border-primary">
                  {form.name?.charAt(0)}
                </span>
              )}
              <Button className="absolute -bottom-1 -right-1 w-8 h-8 flex items-center justify-center shadow-none p-0 rounded-full border-2 border-white hover:shadow-lg">
                <CameraIcon />
              </Button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h4 className="text-2xl font-bold">{form.name}</h4>
                <p className="text-base text-gray-500">{form.user.email}</p>
              </div>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-4">
                  <div className="mb-2">
                    <p className="text-muted-foreground">Joined Date</p>
                    <p>{form.joinedAt || ""}</p>
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="mb-2">
                    <p className="text-muted-foreground">Trial Ends On </p>
                    <p>{form.trialEndsAt || ""}</p>
                  </div>
                </div>
                <div className="col-span-4">
                  <div className="mb-2">
                    <p className="text-muted-foreground">Status</p>
                    {form.status === "ACTIVE" && (
                      <Badge
                        variant="default"
                        className="text-green-700 bg-green-200 hover:bg-green-200 uppercase text-[10px]"
                      >
                        Active
                      </Badge>
                    )}
                    {form.status === "TRIAL_ACTIVE" && (
                      <Badge
                        variant="default"
                        className="text-blue-700 bg-blue-100 hover:bg-blue-200 uppercase text-[10px]"
                      >
                        Trial Active
                      </Badge>
                    )}
                    {form.status === "TRIAL_EXPIRING" && (
                      <Badge
                        variant="default"
                        className="text-red-700 bg-red-200 hover:bg-red-200 uppercase text-[10px]"
                      >
                        Trial Active
                      </Badge>
                    )}
                    {form.status === "TRIAL_EXPIRED" && (
                      <Badge
                        variant="default"
                        className="text-red-500 bg-red-200 hover:bg-red-300 uppercase text-[10px]"
                      >
                        Trial Expired
                      </Badge>
                    )}
                    {form.status === "INACTIVE" && (
                      <Badge
                        variant="default"
                        className="text-white bg-gray-500 hover:bg-gray-700 uppercase text-[10px]"
                      >
                        Inactive
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-auto">
              <Button onClick={() => handleResend(vendor.id)}>
                Send Activation Link
              </Button>
            </div>
          </div>
          <Tabs defaultValue="detail" className="gap-2 items-start">
            <TabsList className="mb-5">
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
            <TabsContent value="detail">
              <form onSubmit={handleDetailSubmit}>
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 lg:col-span-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          Company Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
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
                                setForm((prev) => ({
                                  ...prev,
                                  categoryId: value,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.length === 0 ? (
                                  <SelectItem
                                    key="No-category"
                                    value="No-Category"
                                  >
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
                            className="h-56"
                          />
                        </div>
                        <div className="mb-2">
                          <Label htmlFor="cancellation_policy">
                            Cancellation Policy
                          </Label>
                          <Textarea
                            name="cancellation_policy"
                            value={form.cancellation_policy || ""}
                            onChange={handleChange}
                            className="h-56"
                          />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="my-5">
                      <CardHeader>
                        <CardTitle>
                          User Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-12 mb-2 gap-2">
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
                      </CardContent>
                    </Card>
                  </div>
                </div>
                <div className="py-2">
                  <Button onClick={handleDetailSubmit}>Save</Button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="services">
              <ServiceList vendorId={form.id} />
            </TabsContent>
            <TabsContent value="location">
              {form.location ? (
                <p>{form.address}</p>
              ) : (
                <div className="flex gap-2 flex-col border rounded py-6 justify-center items-center">
                  <h4 className="font-bold text-lg">No Location added</h4>
                  <p className="text-base">You havent added a location yet.</p>
                  <Button onClick={() => setAddLocationOpen(true)}>
                    Add Location
                  </Button>
                  {openAddLocation && (
                    <AddLocation
                      setAddLocationOpen={setAddLocationOpen}
                      open={openAddLocation}
                    />
                  )}
                </div>
              )}
              {/* <Map/> */}
            </TabsContent>
            <TabsContent value="businesshours">
              <BusinessHours />
            </TabsContent>
            <TabsContent value="professionals">
              <ProfessionalList vendorId={form.id} />
            </TabsContent>
            <TabsContent value="photos">Coming Soon</TabsContent>
            <TabsContent value="reviews">Review Comming Soon</TabsContent>
          </Tabs>
        </>
      )}
    </UsersLayout>
  );
}
