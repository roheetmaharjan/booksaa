"use client";

import { useEffect, useMemo, useState } from "react";
import { Banknote, ScanQrCode, X } from "lucide-react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { currency } from "@/lib/appointments";
import { StageBadges } from "./StageBadges";

function toAmount(value) {
  const amount = Number.parseFloat(value);
  return Number.isFinite(amount) ? Math.max(0, amount) : 0;
}

function MoneyInput({ value, onChange, label }) {
  return (
    <label className="flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 focus-within:border-primary">
      <span className="text-xs text-muted-foreground w-[20px] text-center">$</span>
      <input aria-label={label} type="number" min="0" step="0.01" inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value)} className="w-16 bg-transparent border-none text-right text-sm font-semibold outline-none py-1 px-0" />
    </label>
  );
}

function SummaryRow({ label, value, children, strong = false }) {
  return (
    <div className={`flex items-center justify-between gap-3 border-b border-border px-5 py-3 ${strong ? "bg-card" : ""}`}>
      <span className={strong ? "font-display text-lg font-semibold" : "text-sm text-muted-foreground"}>{label}</span>
      {children || <span className={strong ? "font-display text-lg font-semibold" : "font-semibold"}>{value}</span>}
    </div>
  );
}

export function AppointmentDetail({ appt, onClose, onConfirm, onArrive, onCheckout, onQrPaid }) {
  const [discount, setDiscount] = useState("0");
  const [tip, setTip] = useState("0");
  const [amountPaid, setAmountPaid] = useState("0");
  const [qrPayment, setQrPayment] = useState(null);
  const [qrError, setQrError] = useState("");
  const subtotal = useMemo(() => appt.services.reduce((sum, service) => sum + Number(service.price || 0), 0), [appt.services]);
  const priorPaid = Number(appt.paid?.total || 0);
  const discountAmount = toAmount(discount);
  const tipAmount = toAmount(tip);
  const total = Math.max(0, subtotal - discountAmount) + tipAmount;
  const amountPaidValue = toAmount(amountPaid);
  const amountDue = Math.max(0, total - priorPaid);
  const changeDue = Math.max(0, amountPaidValue - amountDue);

  useEffect(() => {
    const initialTip = Number(appt.paid?.tip || 0);
    const initialTotal = Math.max(0, subtotal + initialTip - Number(appt.paid?.total || 0));
    setDiscount("0");
    setTip(String(initialTip));
    setAmountPaid(initialTotal.toFixed(2));
  }, [appt.id, appt.paid?.tip, appt.paid?.total, subtotal]);

  const pay = (method) => onCheckout(amountPaidValue, method);
  const startQrPayment = async () => {
    setQrError("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${appt.id}/qr-payment`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amountPaid: amountPaidValue, bookingIds: appt.bookingIds }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to create QR payment");
      const imageUrl = await QRCode.toDataURL(result.checkoutUrl, { width: 320, margin: 2 });
      setQrPayment({ ...result, imageUrl });
    } catch (error) {
      setQrError(error.message);
    }
  };

  useEffect(() => {
    if (!qrPayment) return undefined;
    const poll = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${appt.id}/qr-payment/${qrPayment.sessionId}`);
      const result = await response.json();
      if (result.paid) {
        setQrPayment(null);
        await onQrPaid?.();
      }
    };
    poll();
    const timer = window.setInterval(poll, 2500);
    return () => window.clearInterval(timer);
  }, [appt.id, onQrPaid, qrPayment]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl font-semibold text-gray-800">{appt.client}</h2>
            <StageBadges appt={appt} />
          </div>
          <p className="mt-1 font-mono text-sm text-muted-foreground">{appt.phone}</p>
        </div>
        <Button variant="ghost" size="icon" className="size-8" onClick={onClose} aria-label="Close appointment details">
          <X className="size-4" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto board-scroll items-stretch h-full">
        <div className="grid grid-cols-1 lg:grid-cols-8 h-full">
          <div className="col-span-5">
            <div className="flex flex-wrap gap-x-6 gap-y-1 border-b border-border px-5 py-3 text-sm">
              <span>
                <span className="text-muted-foreground">Show rate: </span>
                <b>{appt.showRate}%</b>
              </span>
              <span>
                <span className="text-muted-foreground">Avg. visit: </span>
                <b>{currency(appt.avgVisit)}</b>
              </span>
            </div>
            <p className="flex justify-between border-b border-border px-5 py-3 text-sm">
              <b>Booked Date :</b>
              <span>
                {appt.bookedOn}
              </span>
            </p>
            <div className="px-5 py-4">
              <div className="overflow-hidden rounded-lg border border-border">
                <div className="grid grid-cols-[minmax(0,1fr)_120px_90px] bg-secondary/60 px-3 py-2 text-[10px] font-700 uppercase tracking-wide text-muted-foreground">
                  <span>Service name</span>
                  <span>Professional</span>
                  <span className="text-right">Price</span>
                </div>
                {appt.services.map((service) => (
                  <div key={service.bookingId || service.id} className="grid grid-cols-[minmax(0,1fr)_120px_90px] items-center border-t border-border px-3 py-3 text-sm">
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {service.duration} min · {service.start}–{service.end}
                      </p>
                    </div>
                    <span className="truncate text-muted-foreground">{service.staff}</span>
                    <span className="text-right font-mono font-medium">{currency(service.price)}</span>
                  </div>
                ))}
              </div>
              {appt.note && (
                <div className="mt-5 border-t border-border pt-3">
                  <p className="text-eyebrow text-muted-foreground">Notes</p>
                  <p className="mt-1 text-sm">{appt.note}</p>
                </div>
              )}
            </div>
          </div>
          <aside className="col-span-3 bg-gray-100">
            <div className="flex h-full flex-col">
              <SummaryRow label="Services" value={currency(subtotal)} />
              <SummaryRow label="Discount">
                <MoneyInput label="Discount" value={discount} onChange={setDiscount} />
              </SummaryRow>
              <SummaryRow label="Deposit paid" value={`− ${currency(priorPaid)}`} />
              <SummaryRow label="Tip">
                <MoneyInput label="Tip" value={tip} onChange={setTip} />
              </SummaryRow>
              <SummaryRow label="Total" value={currency(total)} />
              <SummaryRow label="Amount due" value={currency(amountDue)} />
              {appt.stage !== "completed" && (
                <SummaryRow label="Amount paid">
                  <MoneyInput label="Amount paid" className="border-none" value={amountPaid} onChange={setAmountPaid} />
                </SummaryRow>
              )}
              {appt.stage !== "completed" && <SummaryRow label="Change due" value={currency(changeDue)} />}
              <div className="p-5 mt-auto">
                {qrError && <p className="mb-2 text-sm text-destructive">{qrError}</p>}
                {appt.stage !== "completed" ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" disabled={amountPaidValue <= 0} onClick={() => pay("CASH")}>
                      <Banknote className="size-4" />
                      Pay cash
                    </Button>
                    <Button disabled={amountPaidValue <= 0} onClick={startQrPayment}>
                      <ScanQrCode className="size-4" />
                      Pay by card
                    </Button>
                  </div>
                ) : (
                  <Button className="w-full" variant="outline" disabled>
                    Completed
                  </Button>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
      <Dialog open={Boolean(qrPayment)} onOpenChange={(open) => !open && setQrPayment(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Pay by card</DialogTitle>
            <DialogDescription>Ask {appt.client} to scan this code and complete the secure card payment.</DialogDescription>
          </DialogHeader>
          {qrPayment && (
            <>
              <img className="mx-auto size-72" src={qrPayment.imageUrl} alt={`Stripe payment QR code for ${currency(amountPaidValue)}`} />
              <p className="text-center text-sm font-medium">Waiting for {currency(amountPaidValue)} payment…</p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
