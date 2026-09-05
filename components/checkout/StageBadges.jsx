import { Crown, Gem, HeartHandshake, Ban, Sparkles } from "lucide-react";

export function StageBadges({ appt }) {
  return (
    <div className="flex items-center gap-1.5">
      {appt.newClient && <Sparkles className="size-3.5 text-accent" aria-label="New client" />}

      {appt.membership && <HeartHandshake className="size-3.5 text-status-arrived" aria-label="Member" />}

      {appt.vip && <Crown className="size-3.5 text-accent" aria-label="VIP" />}

      {appt.noShowRisk && <Ban className="size-3.5 text-destructive" aria-label="No-show risk" />}

      {appt.paid && <Gem className="size-3.5 text-primary" aria-label="Paid" />}
    </div>
  );
}
