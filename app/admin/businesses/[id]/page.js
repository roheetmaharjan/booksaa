"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowCircleLeftIcon } from "@phosphor-icons/react";
import { UsersLayout } from "@/app/admin/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Loading from "@/components/common/Loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ServiceList from "@/components/common/ServiceList";
import ProfessionalList from "@/components/common/ProfessionalList";
import { toast } from "sonner";
import BusinessHours from "@/components/common/BusinessHour";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function VendorDetail() {
  const { id: vendorId } = useParams();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const router = useRouter();
  const ownerEmail = vendor?.user?.email || "";
  const ownerName = [vendor?.user?.firstname, vendor?.user?.lastname]
    .filter(Boolean)
    .join(" ");
  const billing = vendor?.billingSummary;

  const handleResend = async (email) => {
    try {
      const res = await fetch("/api/businesses/resend-activation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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

  useEffect(() => {
    if (!vendorId) return;

    const url = selectedLocationId
      ? `/api/businesses/${vendorId}?locationId=${selectedLocationId}`
      : `/api/businesses/${vendorId}`;
    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setVendor(data);
        if (data?.selectedLocationId && !selectedLocationId) {
          setSelectedLocationId(data.selectedLocationId);
        }
      })
      .catch((err) => {
        console.error("Error:", err);
        setVendor(null);
      })
      .finally(() => setLoading(false));
  }, [vendorId, selectedLocationId]);

  const handleEditClick = (vendorId)=>{
    setEditLoading(true);
    router.push(`/admin/businesses/${vendorId}/edit-business`)
  }

  return (
    <UsersLayout>
      <Link href="/" className="text-3xl">
        <ArrowCircleLeftIcon />
      </Link>

      {loading ? (
        <Loading />
      ) : vendor ? (
        <>
          <div className="flex items-center gap-4 mt-4 mb-4 flex-col md:flex-row">
            <figure>
              {vendor.image ? (
                <img
                  src={vendor.image}
                  alt={`${vendor.name} Image`}
                  className="h-10 w-10 object-cover rounded"
                />
              ) : (
                <span className="w-24 h-24 bg-primary/10 uppercase flex items-center justify-center rounded-md text-3xl font-bold border border-primary">
                  {vendor.name?.charAt(0)}
                </span>
              )}
            </figure>
            <div className="flex flex-col gap-1">
              <h4 className="text-2xl font-bold">{vendor.name}</h4>
              <p className="text-gray-500">{ownerEmail || "-"}</p>
            </div>
            <div className="flex gap-2 ml-auto">
              <Button onClick={() => handleResend(ownerEmail)} disabled={!ownerEmail}>Send Activation Link</Button>
              <Button onClick={() => handleEditClick(vendor.id)} variant="outline" >Edit Profile</Button>
            </div>
          </div>
          <Tabs defaultValue="detail">
            <TabsList>
              <TabsTrigger value="detail">Detail</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="professionals">Professionals</TabsTrigger>
              <TabsTrigger value="businesshours">Business Hours</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            {vendor.locations?.length > 0 && (
              <div className="my-4 max-w-sm">
                <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendor.locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name || location.address}
                        {location.isDefault ? " (Default)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <TabsContent value="detail">
              {billing && (
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle>Subscription Estimate</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-12 gap-3 text-sm">
                    <div className="col-span-12 md:col-span-3">
                      <p className="text-gray-500">Total</p>
                      <p className="font-semibold">
                        {billing.totalPrice} / {billing.billingCycle}
                      </p>
                    </div>
                    <div className="col-span-12 md:col-span-3">
                      <p className="text-gray-500">Base</p>
                      <p>{billing.basePrice}</p>
                    </div>
                    <div className="col-span-12 md:col-span-3">
                      <p className="text-gray-500">Extra Professionals</p>
                      <p>{billing.extraProfessionals} x {billing.extraProfessionalPrice}</p>
                    </div>
                    <div className="col-span-12 md:col-span-3">
                      <p className="text-gray-500">Extra Locations</p>
                      <p>{billing.extraLocations} x {billing.extraLocationPrice}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 lg:col-span-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Detail</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <table>
                        <tbody>
                          <tr>
                            <td className="py-1 text-gray-500">Name</td>
                            <td className="py-1 pl-6">
                              {ownerName || "-"}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1 text-gray-500">Email</td>
                            <td className="py-1 pl-6">
                              {ownerEmail || "-"}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1 text-gray-500">Joined Date</td>
                            <td className="py-1 pl-6">{vendor.joinedAt}</td>
                          </tr>
                          <tr>
                            <td className="py-1 text-gray-500">Status</td>
                            <td className="py-1 pl-6">
                              {vendor.status === "ACTIVE" ? (
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
                          <tr>
                            <td className="py-1 text-gray-500">Plan</td>
                            <td className="py-1 pl-6">
                              {vendor.plan?.name || "-"}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1 text-gray-500">Category</td>
                            <td className="py-1 pl-6">
                              {vendor.category?.name || "-"}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </div>
                <div className="col-span-12 md:col-span-8 gap-4 grid">
                  <Card>
                    <CardHeader>
                      <CardTitle>Company Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-12">
                        <div className="col-span-6">
                          {vendor.location?.address || "-"}
                        </div>
                        <div className="col-span-6">
                          <table>
                            <tbody>
                              <tr>
                                <td className="py-1 text-gray-500">Email</td>
                                <td className="py-1 pl-6">
                                  {vendor.email || "-"}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1 text-gray-500">
                                  Website
                                </td>
                                <td className="py-1 pl-6">{vendor.website || "-"}</td>
                              </tr>
                              <tr>
                                <td className="py-1 text-gray-500">Phone</td>
                                <td className="py-1 pl-6">
                                  {vendor.phone || "-"}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <h4 className="font-bold">About</h4>
                      <p>{vendor.description || "-"}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Locations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {vendor.location ? (
                        <div className="space-y-2 text-sm">
                          <p className="font-medium text-slate-900">
                            {vendor.location.name || "Location"}
                          </p>
                          <p className="text-slate-500">{vendor.location.address}</p>
                          <p className="text-slate-500">
                            Phone: {vendor.location.phone || vendor.phone || "-"}
                          </p>
                          <p className="text-slate-500">
                            {vendor.location.offerAtBusiness
                              ? "Services at business location"
                              : null}
                            {vendor.location.offerAtBusiness &&
                            vendor.location.offerAtClient
                              ? " and "
                              : null}
                            {vendor.location.offerAtClient
                              ? "travels to clients"
                              : null}
                          </p>
                          {vendor.location.offerAtClient && (
                            <p className="text-slate-500">
                              Travel fee: ${vendor.location.travelFee || 0} - Max distance:{" "}
                              {vendor.location.maxTravelDistance || 0}
                            </p>
                          )}
                        </div>
                      ) : (
                        "-"
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Cancelation Policy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{vendor.cancellation_policy}</p>   
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="services">
              <ServiceList vendorId={vendor.id} locationId={selectedLocationId}/>
            </TabsContent>
            <TabsContent value="professionals">
              <ProfessionalList vendorId={vendor.id} locationId={selectedLocationId}/>
            </TabsContent>
            <TabsContent value="businesshours">
              <BusinessHours
                vendorId={vendor.id}
                locationId={selectedLocationId}
                initialHours={vendor.businessHours || []}
                onSaved={() => {
                  fetch(`/api/businesses/${vendor.id}?locationId=${selectedLocationId}`)
                    .then((res) => res.json())
                    .then((data) => setVendor(data));
                }}
              />
            </TabsContent>
            <TabsContent value="photos">Coming Soon</TabsContent>
            <TabsContent value="reviews">Review Comming Soon</TabsContent>
          </Tabs>
        </>
      ) : (
        <h4>Vendor not found</h4>
      )}
    </UsersLayout>
  );
}
