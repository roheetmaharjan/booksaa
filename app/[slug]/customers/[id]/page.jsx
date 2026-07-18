"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import Loading from "@/components/common/Loading";
import { CustomerProfile } from "@/components/customers/CustomerProfile";

export default function CustomerProfilePage() {
  const params = useParams();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noteContent, setNoteContent] = useState("");

  const loadCustomer = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/customers/${params.id}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to load customer.");
      }

      setCustomer(data.customer);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params?.id) {
      loadCustomer();
    }
  }, [params?.id]);

  const addNote = async () => {
    if (!customer || !noteContent.trim()) return;

    try {
      const res = await fetch(`/api/customers/${customer.id}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: noteContent,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Unable to add note.");
      }

      setNoteContent("");
      await loadCustomer();
    } catch (error) {
      console.error(error);
    }
  };
  const quickAction = (type) => {
    if (!customer) return;

    switch (type) {
      case "call":
        if (customer.phone) {
          window.location.href = `tel:${customer.phone}`;
        }
        break;

      case "sms":
        if (customer.phone) {
          window.location.href = `sms:${customer.phone}`;
        }
        break;

      case "email":
        if (customer.email) {
          window.location.href = `mailto:${customer.email}`;
        }
        break;

      case "book":
        window.location.href = `/business/calendar?customerId=${customer.id}`;
        break;

      default:
        console.log(type);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!customer) {
    return <div>Customer not found.</div>;
  }

  return (
    <>
      <div className="container">
        <div className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
          <CustomerProfile customer={customer} noteContent={noteContent} setNoteContent={setNoteContent} addNote={addNote} quickAction={quickAction} />
        </div>
      </div>
    </>
  );
}
