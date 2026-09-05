"use client";

import { useEffect, useMemo, useState } from "react";
import { CreditCard, Banknote, Gift, Minus, Trash2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { currency } from "@/lib/appointments";

const TIPS = [0, 15, 18, 20, 25];

const METHODS = [
  {
    id: "Visa •• 4242",
    label: "Card on file",
    icon: CreditCard,
  },
  {
    id: "Cash",
    label: "Cash",
    icon: Banknote,
  },
  {
    id: "Gift card",
    label: "Gift card",
    icon: Gift,
  },
];

const TAX_RATE = 0.08;

export function CheckoutDialog({ appt, open, onOpenChange, onComplete }) {
  const [lines, setLines] = useState([]);
  const [tipPct, setTipPct] = useState(20);
  const [method, setMethod] = useState(METHODS[0].id);
  useEffect(() => {
    if (!appt) return;
    setLines(appt.services || []);
    setTipPct(20);
    setMethod(METHODS[0].id);
  }, [appt]);

  const { subtotal, tax, tip, total } = useMemo(() => {
    const sub = lines.reduce((s, l) => s + l.price, 0);

    const tp = (sub * tipPct) / 100;
    const tx = sub * TAX_RATE;

    return {
      subtotal: sub,
      tax: tx,
      tip: tp,
      total: sub + tx + tp,
    };
  }, [lines, tipPct]);

  if (!appt) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-4 text-left">
          <DialogTitle className="font-display text-xl">Checkout — {appt.client}</DialogTitle>

          <DialogDescription>
            Mon, Jul 8th · {appt.start} – {appt.end} · {appt.phone}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-[1.4fr_1fr]">
          {/* Ticket */}
          <div className="border-border p-6 md:border-r">
            <p className="text-eyebrow text-muted-foreground">Ticket</p>

            <ul className="mt-3 divide-y divide-border">
              {lines.map((l, i) => (
                <li key={`${l.id}-${i}`} className="flex items-center gap-3 py-2.5 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{l.name}</p>

                    <p className="text-xs text-muted-foreground">
                      {l.staff} · {l.duration} min
                    </p>
                  </div>

                  <span className="font-mono text-sm">{currency(l.price)}</span>

                  <button type="button" aria-label={`Remove ${l.name}`} onClick={() => setLines(lines.filter((_, idx) => idx !== i))} className="text-muted-foreground transition-colors hover:text-destructive">
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}

              {lines.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">No items on this ticket yet.</li>}
            </ul>
          </div>

          {/* Payment */}
          <div className="bg-secondary/50 p-6">
            {/* Tip */}
            <p className="text-eyebrow text-muted-foreground">Tip</p>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {TIPS.map((t) => (
                <button key={t} type="button" onClick={() => setTipPct(t)} className={cn("rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors", tipPct === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/50")}>
                  {t === 0 ? "None" : `${t}%`}
                </button>
              ))}
            </div>

            {/* Payment Method */}
            <p className="text-eyebrow mt-5 text-muted-foreground">Payment method</p>

            <div className="mt-2 space-y-1.5">
              {METHODS.map((m) => (
                <button key={m.id} type="button" onClick={() => setMethod(m.id)} className={cn("flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors", method === m.id ? "border-primary bg-card font-medium text-primary" : "border-border bg-card hover:border-primary/40")}>
                  <m.icon className="size-4" />
                  {m.label}
                </button>
              ))}
            </div>

            {/* Summary */}
            <dl className="mt-5 space-y-1.5 border-t border-border pt-4 text-sm">
              <Row label="Subtotal" value={currency(subtotal)} />

              <Row label={`Tip (${tipPct}%)`} value={currency(tip)} />

              <Row label="Tax" value={currency(tax)} />

              <div className="flex items-center justify-between border-t border-border pt-2">
                <dt className="font-display text-base font-semibold">Total</dt>

                <dd className="font-display text-lg font-semibold">{currency(total)}</dd>
              </div>
            </dl>

            {/* Charge */}
            <Button className="mt-4 w-full" size="lg" disabled={lines.length === 0} onClick={() => onComplete(appt.id, total, method, tip)}>
              Charge {currency(total)}
            </Button>

            {/* Cancel */}
            <Button variant="ghost" className="mt-1 w-full" onClick={() => onOpenChange(false)}>
              <Minus className="size-4" />
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>

      <dd className="font-mono">{value}</dd>
    </div>
  );
}
