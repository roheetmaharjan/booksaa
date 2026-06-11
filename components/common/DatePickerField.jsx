import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Calendar as ShadCalendar } from "@/components/ui/calendar";
import { format as fnsFormat, parse, startOfWeek, getDay } from "date-fns";

function toDateString(date) {
  return format(date, "yyyy-MM-dd");
}

function toTimeString(date) {
  return format(date, "HH:mm");
}

// ─── RBC localizer ────────────────────────────────────────────────────────────

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format: fnsFormat,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function DatePickerField({ value, onChange, minDate }) {
  const [open, setOpen] = useState(false);
  const selected = value ? new Date(value) : undefined;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal text-sm h-9">
          {value ? format(new Date(value), "MMM d, yyyy") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <ShadCalendar
          mode="single"
          selected={selected}
          onSelect={(day) => {
            if (day) {
              onChange(toDateString(day));
              setOpen(false);
            }
          }}
          disabled={(day) => (minDate ? startOfDay(day) < startOfDay(minDate) : false)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
