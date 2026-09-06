import { Footprints } from "lucide-react";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/appointments";
import { StageBadges } from "./StageBadges";

const accentByStage = {
  unconfirmed: "before:bg-status-unconfirmed",
  confirmed: "before:bg-status-confirmed",
  walkin: "before:bg-status-walkin",
  arrived: "before:bg-status-arrived",
  in_service: "before:bg-status-arrived",
  completed: "before:bg-status-completed",
};

export function AppointmentCard({ appt, active, onSelect }) {
  return (
    <button type="button" onClick={onSelect} className={cn("group relative w-full overflow-hidden rounded-md border bg-card px-3 py-2.5 text-left shadow-card transition-all", "before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:content-['']", accentByStage[appt.stage], active ? "border-primary ring-2 ring-primary/25" : "border-border hover:-translate-y-px hover:border-primary/40 hover:shadow-pop/40")}>
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-[11px] font-semibold text-secondary-foreground">{initials(appt.client)}</span>

        <div className="min-w-0 flex-1">
          {appt.waitedMinutes ? (
            <span className="flex items-center gap-1 text-[11px] font-medium text-status-unconfirmed">
              <Footprints className="size-3" />
              {appt.waitedMinutes}m ago
            </span>
          ) : (
            <span className="block text-[11px] text-muted-foreground">
              {appt.start}
              {appt.stage === "completed" ? ` – ${appt.end}` : ""}
            </span>
          )}

          <span className="mt-0.5 block truncate text-[15px] font-medium leading-snug">{appt.client}</span>
          {appt.services.length > 1 && <span className="mt-0.5 block text-[11px] text-muted-foreground">{appt.services.length} services booked</span>}
        </div>

        <StageBadges appt={appt} />
      </div>
    </button>
  );
}
