"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { BoardTopBar } from "@/components/checkout/BoardTopBar";
import { AppointmentCard } from "@/components/checkout/AppointmentCard";
import { AppointmentDetail } from "@/components/checkout/AppointmentDetail";
import { CheckoutDialog } from "@/components/checkout/CheckoutDialog";
import { useFetch } from "@/hooks/useFetch";
import { filterDueBookings } from "@/lib/checkout-utils";
import { currency, STAGES } from "@/lib/appointments";

function displayTime(value) {
  if (!value) return "";
  const [hours, minutes] = String(value).split(":").map(Number);
  if (Number.isNaN(hours)) return String(value);
  return `${hours % 12 || 12}:${String(minutes || 0).padStart(2, "0")}${hours >= 12 ? "pm" : "am"}`;
}

function toAppointment(booking) {
  if (["CANCELED", "PAYMENT_EXPIRED"].includes(booking.status)) return null;
  const service = booking.service;
  const scheduledAt = booking.scheduledAt ? new Date(booking.scheduledAt) : new Date();
  const start = booking.startTime || scheduledAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const end = booking.endTime || (booking.scheduledEnd && new Date(booking.scheduledEnd).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  const paid = Number(booking.paidAmount || 0);
  return {
    id: booking.id,
    stage: booking.status === "COMPLETED" ? "completed" : "confirmed",
    client: booking.customerName || booking.customer?.fullName || "Customer",
    phone: booking.customerPhone || booking.customer?.phone || "",
    start: displayTime(start),
    end: displayTime(end),
    showRate: 100,
    avgVisit: Number(booking.paymentAmount || service?.price || 0),
    visitCadence: "",
    bookedOn: booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : "",
    tags: [],
    note: booking.notes || "",
    services: service ? [{ id: service.id, name: service.name, staff: booking.professional?.name || "Unassigned", price: Number(service.price || booking.paymentAmount || 0), duration: service.duration || 30 }] : [],
    paid: paid > 0 || booking.paymentStatus === "PAID" ? { total: paid, method: booking.paymentMethod || "Card", tip: 0 } : null,
  };
}

export default function CheckoutPage() {
  const params = useSearchParams();
  const bookingId = params.get("bookingId");
  const [query, setQuery] = useState("");
  const [staff, setStaff] = useState("ALL");
  const [selectedId, setSelectedId] = useState(bookingId);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [list, setList] = useState([]);
  const url = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() - 1);
    const end = new Date();
    end.setDate(end.getDate() + 1);
    return `/api/bookings?start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}`;
  }, []);
  const { data, loading, error, refetch } = useFetch(url);

  useEffect(() => {
    const appointments = filterDueBookings(data?.bookings || [])
      .map(toAppointment)
      .filter(Boolean);
    setList(appointments);
    if (bookingId && appointments.some((item) => item.id === bookingId)) setSelectedId(bookingId);
    else if (!selectedId || !appointments.some((item) => item.id === selectedId)) setSelectedId(appointments[0]?.id || null);
  }, [data, bookingId]);

  const filtered = list.filter((item) => item.client.toLowerCase().includes(query.trim().toLowerCase()) && (staff === "ALL" || item.services.some((service) => service.staff === staff)));
  const selected = list.find((item) => item.id === selectedId) || null;
  const staffOptions = ["ALL", ...new Set(list.flatMap((item) => item.services.map((service) => service.staff)).filter(Boolean))];
  const revenue = list.filter((item) => item.paid).reduce((sum, item) => sum + Number(item.paid.total || 0), 0);
  const move = (id, stage, message) => {
    setList((items) => items.map((item) => (item.id === id ? { ...item, stage } : item)));
    toast.success(message);
  };
  const complete = async (id, total, method) => {
    try {
      const response = await fetch(`/api/bookings/${id}/checkout`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amountPaid: total, paymentMethod: method }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to complete checkout");
      setCheckoutOpen(false);
      toast.success(`Checked out — ${currency(total)}`);
      await refetch();
    } catch (checkoutError) {
      toast.error(checkoutError.message);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <BoardTopBar query={query} onQuery={setQuery} staff={staff} onStaff={setStaff} staffOptions={staffOptions} waitlist={0} />
      <div className="flex items-center gap-6 border-b border-border bg-surface-raised/60 px-5 py-2 text-sm">
        <span className="text-muted-foreground">
          Checked out today: <strong className="text-foreground">{currency(revenue)}</strong>
        </span>
        <span className="text-muted-foreground">
          In shop: <strong className="text-foreground">{list.filter((item) => item.stage === "arrived").length}</strong>
        </span>
        {loading && <span className="text-muted-foreground">Loading…</span>}
        {error && (
          <button className="text-destructive" onClick={refetch}>
            Unable to load appointments. Retry
          </button>
        )}
      </div>
      <main className={`flex gap-4 overflow-x-auto board-scroll px-5 py-5 ${selected ? "lg:pr-[440px]" : ""}`}>
        {STAGES.map((stage) => {
          const items = filtered.filter((item) => item.stage === stage.id);
          return (
            <section key={stage.id} className="w-[280px] shrink-0">
              <h2 className="text-lg font-semibold tracking-tight">
                {stage.label} <span className="text-base font-normal italic text-muted-foreground">({items.length})</span>
              </h2>
              <div className="mt-3 space-y-2">
                {items.map((item) => (
                  <AppointmentCard key={item.id} appt={item} active={item.id === selectedId} onSelect={() => setSelectedId(item.id)} />
                ))}
                {!items.length && <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">Nothing here</p>}
              </div>
            </section>
          );
        })}
      </main>
      {selected && (
        <aside className="fixed bottom-0 right-0 top-0 z-30 w-full max-w-[420px] border-l border-border bg-card shadow-pop">
          <AppointmentDetail appt={selected} onClose={() => setSelectedId(null)} onConfirm={() => move(selected.id, "confirmed", `${selected.client} confirmed`)} onArrive={() => move(selected.id, "arrived", `${selected.client} marked as arrived`)} onCheckout={() => setCheckoutOpen(true)} onAddTag={() => toast("Tags are managed from the customer profile")} />
        </aside>
      )}
      <CheckoutDialog appt={selected} open={checkoutOpen} onOpenChange={setCheckoutOpen} onComplete={complete} />
      <Toaster />
    </div>
  );
}
