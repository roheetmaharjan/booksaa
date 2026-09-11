"use client";

import { useState } from "react";
import { AlertTriangle, Banknote, CreditCard, ScanQrCode, Plus, X, RotateCcw, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { currency } from "@/lib/appointments";
import { cn } from "@/lib/utils";
import { StageBadges } from "./StageBadges";
import { PAYMENT_METHODS } from "@/constants/payment"

export function AppointmentDetail({ appt, onClose, onConfirm, onArrive, onCheckout }) {
  const total = appt.services.reduce((s, x) => s + x.price, 0);
  const paid = appt.paid || { total: 0, method: "Not paid", tip: 0 };
  const [paymentMethod, setPaymentMethod] = useState("CARD");

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

        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="size-8" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto board-scroll">
        <div className="grid grid-cols-1 lg:grid-cols-8">
          <div className="col-span-5">
            <dl className="flex flex-wrap gap-x-6 gap-y-1 border-b border-border px-5 py-3 text-sm">
              <div className="flex gap-1.5">
                <dt className="text-muted-foreground">Show Rate:</dt>
                <dd className="font-medium">{appt.showRate}%</dd>
              </div>

              <div className="flex gap-1.5">
                <dt className="text-muted-foreground">Avg. Visit:</dt>
                <dd className="font-medium">
                  {currency(appt.avgVisit)} <span className="font-normal text-muted-foreground">{appt.visitCadence}</span>
                </dd>
              </div>
            </dl>
            <p className="border-b border-border px-5 py-3 text-sm flex justify-between">
              <b>Appointment Date & Time:</b>{" "}
              <span>
                {appt.bookedOn},{appt.start} – {appt.end}
              </span>
            </p>
            <div className="px-5 py-4">
              <table className="w-full text-left border">
                <thead>
                  <tr>
                    <th className="py-2 px-3">Item</th>
                    <th className="py-2 px-3">Professional</th>
                    <th className="py-2 px-3">Price</th>
                    <th className="py-2 px-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {appt.services.map((service) => (
                    <tr key={service.bookingId || s.id}>
                      <td className="py-2 px-3">
                        <div>{service.name}</div>
                      </td>
                      <td className="py-2 px-3">
                        <span>{service.staff}</span>
                      </td>
                      <td className="py-2 px-3">{currency(service.price)}</td>
                      <td className="py-2 px-3">
                        <button type="button">
                          <Trash2Icon size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t pt-3">
                <p className="text-eyebrow text-muted-foreground">Appointment Tags</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {appt.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="border-t pt-3">
                <p className="text-eyebrow text-muted-foreground">Notes</p>
                {appt.note && <p>{appt.note}</p>}
              </div>
            </div>
          </div>
          <div className="col-span-3">
            <div className="bg-gray-100 h-full">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <span className="text-sm text-muted-foreground">Services</span>
                <span className="text-md font-semibold">-</span>
              </div>
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <span className="text-sm text-muted-foreground">Discount</span>
                <span className="text-md font-semibold">-</span>
              </div>
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <span className="text-sm text-muted-foreground">Deposit ({paid.method || "Not paid"})</span>
                <span className="text-md font-semibold">{currency(Number(paid.total || 0))}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <span className="text-sm text-muted-foreground">Tax</span>
                <span className="text-md font-semibold">-</span>
              </div>
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <span className="text-sm text-muted-foreground">Tip</span>
                <span className="text-md font-semibold">{currency(Number(paid.tip || 0))}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <span className="font-display text-lg font-semibold">Amount Due</span>
                <span className="font-display text-lg font-semibold">{currency(total)}</span>
              </div>
              {appt.stage !== "completed" && (
                <div className="px-5 py-4">
                  <p className="text-eyebrow text-muted-foreground">Payment method</p>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {PAYMENT_METHODS.map((method) => (
                      <button key={method.id} type="button" onClick={() => setPaymentMethod(method.id)} className={cn("flex items-center justify-center gap-1 rounded-md border px-2 py-2 text-xs font-medium transition-colors", paymentMethod === method.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/40")}>
                        <method.icon className="size-3.5" />
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <span className="text-sm text-muted-foreground">Amount Paid</span>
                <span className="text-md font-semibold">-</span>
              </div>
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <span className="text-sm text-muted-foreground">Change Due</span>
                <span className="text-md font-semibold">-</span>
              </div>
            </div>
            <div className="flex items-center gap-2 border-t border-border bg-secondary/60 px-5 py-3">
              <div className="ml-auto flex gap-2">
                {appt.stage === "unconfirmed" && (
                  <Button variant="outline" onClick={onConfirm}>
                    Confirm
                  </Button>
                )}

                {appt.stage !== "arrived" && appt.stage !== "completed" && (
                  <Button variant="outline" onClick={onArrive}>
                    Mark as Arrived
                  </Button>
                )}

                {appt.stage !== "completed" ? (
                  <Button onClick={() => onCheckout(total, paymentMethod)}>Checkout {currency(total)}</Button>
                ) : (
                  <Button variant="outline" disabled>
                    Completed
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
