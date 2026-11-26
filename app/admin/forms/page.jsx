"use client";

import AdminLayout from "@/app/admin/layout";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function FormsPage() {
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState("");

  const openBuilder = async () => {
    setOpening(true);
    setError("");
    try {
      const response = await fetch("/api/integrations/forms/session", { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to open the form builder.");
      if (!result.data?.url) throw new Error("Form Service did not return a builder URL.");
      window.location.assign(result.data.url);
    } catch (requestError) {
      setError(requestError.message || "Unable to connect to Form Service.");
      setOpening(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container-fluid py-6">
        <h1 className="page-title">Forms</h1>
        <p className="mt-2 text-gray-600">
          Create, edit, publish, and manage Booksaa forms in the Form Service builder.
        </p>
        <div className="mt-6 rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold">Form builder</h2>
          <p className="mt-2 text-sm text-gray-600">
            Your forms are isolated to the Booksaa partner account configured for this connection.
          </p>
          <Button className="mt-4" onClick={openBuilder} disabled={opening}>
            {opening ? "Connecting..." : "Open form builder"}
          </Button>
          {error && <p className="mt-3 text-sm text-red-600" role="alert">{error}</p>}
        </div>
      </div>
    </AdminLayout>
  );
}
