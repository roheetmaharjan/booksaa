"use client";

import { useEffect, useState } from "react";
import { CalendarDays, LoaderCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function DemoRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadRequests() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/demo-requests");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load demo requests.");
      setRequests(data.requests);
    } catch (loadError) {
      setError(loadError.message || "Unable to load demo requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  return (
    <div className="container-fluid space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Demo requests</h1>
          <p className="mt-1 text-sm text-slate-500">Review businesses that requested a personalized Booksaa demo.</p>
        </div>
        <Button variant="outline" onClick={loadRequests} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead>Contact</TableHead>
              <TableHead>Business</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Locations / team</TableHead>
              <TableHead>Phone / email</TableHead>
              <TableHead>Submitted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                  <LoaderCircle className="mr-2 inline h-4 w-4 animate-spin" /> Loading demo requests...
                </TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-36 text-center">
                  <CalendarDays className="mx-auto mb-2 h-5 w-5 text-slate-400" />
                  <p className="font-medium text-slate-700">No demo requests yet</p>
                  <p className="mt-1 text-sm text-slate-500">New submissions will appear here.</p>
                </TableCell>
              </TableRow>
            ) : requests.map((request) => (
              <TableRow key={request.id} className="align-top">
                <TableCell className="font-medium text-slate-900">{request.firstName} {request.lastName}</TableCell>
                <TableCell>
                  <p className="font-medium text-slate-800">{request.businessName}</p>
                  {request.software && <p className="mt-1 text-xs text-slate-500">Uses {request.software}</p>}
                  {request.notes && <p className="mt-2 max-w-xs whitespace-pre-wrap text-xs text-slate-500">{request.notes}</p>}
                </TableCell>
                <TableCell>{request.industry}</TableCell>
                <TableCell>
                  <p>{request.locations}</p>
                  <p className="mt-1 text-xs text-slate-500">{request.staffCount}</p>
                </TableCell>
                <TableCell>
                  <a className="block text-slate-800 hover:underline" href={`mailto:${request.businessEmail}`}>{request.businessEmail}</a>
                  <a className="mt-1 block text-xs text-slate-500 hover:underline" href={`tel:${request.phone}`}>{request.phone}</a>
                </TableCell>
                <TableCell className="whitespace-nowrap text-slate-500">{formatDate(request.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-sm text-slate-500">{requests.length} {requests.length === 1 ? "request" : "requests"}</p>
    </div>
  );
}
