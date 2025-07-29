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

export default function VendorDetail() {
  const { id: vendorId } = useParams();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

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

      toast.success(data.message); // Or use toast/message
    } catch (error) {
      console.error("Resend failed:", error);
      toast.error(error.message); // Or show a toast for errors
    }
  };

  useEffect(() => {
    if (!vendorId) return;

    fetch(`/api/vendors/${vendorId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setVendor(data))
      .catch((err) => {
        console.error("Error:", err);
        setVendor(null);
      })
      .finally(() => setLoading(false));
  }, [vendorId]);

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
              <p className="text-gray-500">{vendor.user.email}</p>
            </div>
            <div className="flex gap-2 ml-auto">
              <Button onClick={() => handleResend(vendor.id)}>Send Activation Link</Button>
              <Button variant="outline">Edit Profile</Button>
            </div>
          </div>
          <Tabs defaultValue="detail">
            <TabsList>
              <TabsTrigger value="detail">Detail</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="professionals">Professionals</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="detail">
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
                              {vendor.user.firstname + vendor.user.lastname}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1 text-gray-500">Email</td>
                            <td className="py-1 pl-6">
                              {vendor.user.email || "-"}
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
                              {vendor.plan.name || "-"}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1 text-gray-500">Category</td>
                            <td className="py-1 pl-6">
                              {vendor.category.name || "-"}
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
                          {vendor.location || "-"}
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
                      locations
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
            <TabsContent value="services">comming soon</TabsContent>
            <TabsContent value="professionals">Coming Soon</TabsContent>
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
