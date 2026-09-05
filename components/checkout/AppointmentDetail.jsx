import { AlertTriangle, ChevronDown, Plus, ThumbsUp, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { currency } from "@/lib/appointments";
import { StageBadges } from "./StageBadges";

export function AppointmentDetail({ appt, onClose, onConfirm, onArrive, onCheckout, onAddTag }) {
  const total = appt.services.reduce((s, x) => s + x.price, 0);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl font-semibold text-primary">{appt.client}</h2>
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

        <p className="border-b border-border px-5 py-3 text-sm font-medium">
          Mon, Jul 8th, {appt.start} – {appt.end}
        </p>

        <ul className="divide-y divide-border border-b border-border">
          {appt.services.map((s) => (
            <li key={s.id} className="flex items-center gap-3 px-5 py-3 text-sm">
              <span className="w-16 shrink-0 text-muted-foreground">{appt.start}</span>

              <span className="flex-1 font-medium">{s.name}</span>

              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="size-2 rounded-full bg-accent" />
                {s.staff}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <span className="font-display text-lg font-semibold">{currency(total)}</span>

          <span className="text-xs text-muted-foreground">Booked on {appt.bookedOn}</span>
        </div>

        {appt.note && (
          <p className="flex items-start gap-2 border-b border-border px-5 py-3 text-sm font-medium">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
            {appt.note}
          </p>
        )}

        <div className="px-5 py-4">
          <p className="text-eyebrow text-muted-foreground">Appointment Tags</p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {appt.tags.map((t) => (
              <span key={t} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                {t}
              </span>
            ))}

            <button type="button" onClick={onAddTag} className="flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:border-primary hover:text-primary">
              Add tags <Plus className="size-3" />
            </button>
          </div>
        </div>

        {appt.paid && (
          <div className="mx-5 mb-4 rounded-md bg-secondary px-4 py-3 text-sm">
            <p className="font-medium">Checked out — {currency(appt.paid.total)}</p>

            <p className="text-muted-foreground">
              {appt.paid.method} · tip {currency(appt.paid.tip)}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-border bg-secondary/60 px-5 py-3">
        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
          <RotateCcw className="size-4" />
        </Button>

        <Button variant="ghost" size="icon" className="size-8 text-destructive">
          <X className="size-4" />
        </Button>

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
            <Button onClick={onCheckout}>Checkout</Button>
          ) : (
            <Button variant="outline" disabled>
              Completed
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
