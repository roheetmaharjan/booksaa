"use client";

import { useEffect, useState } from "react";
import { Card, CardContent,CardHeader,CardTitle,CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function buildHours(initialHours = []) {
  return daysOfWeek.map((day) => {
    const saved = initialHours.find((hour) => hour.day === day);
    return {
      day,
      open: !!saved?.isOpen,
      openTime: saved?.openTime || "09:00",
      closeTime: saved?.closeTime || "17:00",
    };
  });
}

export default function BusinessHours({ vendorId, locationId, initialHours = [], onSaved }) {
  const [hours, setHours] = useState(
    buildHours(initialHours)
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setHours(buildHours(initialHours));
  }, [initialHours, locationId]);

  const updateDay = (index, key, value) => {
    setHours((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [key]: value };
      return updated;
    });
  };

  // Generate 30-min time slots
  const timeSlots = Array.from({ length: 24 }, (_, h) => [
    `${h.toString().padStart(2, "0")}:00`,
    `${h.toString().padStart(2, "0")}:30`,
  ]).flat();

  const handleSave = async () => {
    if (!vendorId || !locationId) {
      toast.error("Select a location before saving hours.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/business-hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorId,
          locationId,
          hours: hours.map((hour) => ({
            day: hour.day,
            isOpen: hour.open,
            openTime: hour.openTime,
            closeTime: hour.closeTime,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save hours.");
      toast.success("Business hours saved.");
      if (onSaved) onSaved(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Business Hours</CardTitle>
          <CardDescription>Set your business hours</CardDescription>
        </CardHeader>
        <CardContent>
          {hours.map((dayConfig, i) => (
            <div key={dayConfig.day} className="border-b last:border-b-0">
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center row-reverse gap-3">
                  <Switch
                    checked={dayConfig.open}
                    onCheckedChange={(val) => updateDay(i, "open", val)}
                  />
                  <Label className="font-medium">{dayConfig.day}</Label>
                </div>
                {dayConfig.open ? (
                  <div className="flex gap-2 items-center">
                    {/* Open Time */}
                    <Select
                      value={dayConfig.openTime}
                      onValueChange={(val) => updateDay(i, "openTime", val)}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <span className="text-sm text-muted-foreground">to</span>

                    {/* Close Time */}
                    <Select
                      value={dayConfig.closeTime}
                      onValueChange={(val) => updateDay(i, "closeTime", val)}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ): (
                  <div>Closed</div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button
            className="w-fit"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Hours"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
