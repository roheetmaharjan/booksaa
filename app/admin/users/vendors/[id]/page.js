"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowCircleLeftIcon } from "@phosphor-icons/react";
import { UsersLayout } from "@/app/admin/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Loading from "@/components/common/Loading";
import {Card,CardContent,CardHeader,CardTitle,} from "@/components/ui/card";

export default function VendorDetail() {
  const { id: vendorId } = useParams();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

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
          <div className="flex items-center gap-4 mt-4 mb-4">
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
          </div>
          <Tabs defaultValue="detail">
            <TabsList>
              <TabsTrigger value="detail">Detail</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="professionals">Professionals</TabsTrigger>
            </TabsList>
            <TabsContent value="detail">
              <div className="grid">
                <div className="col-span-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Highlights</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <table>
                        <tbody>
                          <tr>
                            <td>Location</td>
                            {/* <td>{vendor.location === 0 ? (<h4>No Location</h4>): (<h5>There is loation</h5>)}</td> */}
                          </tr>
                          <tr>
                            <td>Status</td>
                            <td>{vendor.status}</td>
                          </tr>
                          <tr>
                            <td>Joined Date</td>
                            <td>{vendor.joinedAt}</td>
                          </tr>
                          <tr>
                            <td>Phone</td>
                            <td>{vendor.phone || "-"}</td>
                          </tr>
                          <tr>
                            <td>Plan</td>
                            <td>{vendor.planId || "-"}</td>
                          </tr>
                          <tr>
                            <td>Category</td>
                            <td>{vendor.category.name}</td>
                          </tr>
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </div>
                <div className="col-span-9">
                  <Card>
                    <CardHeader>
                      <CardTitle>Location</CardTitle>
                    </CardHeader>
                    <CardContent>
                      this location
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="services">comming soon</TabsContent>
            <TabsContent value="professionals">Coming Soon</TabsContent>
          </Tabs>
        </>
      ) : (
        <h4>Vendor not found</h4>
      )}
    </UsersLayout>
  );
}
