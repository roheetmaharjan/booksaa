"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function BusinessHours() {
  const [hours, setHours] = useState(
    daysOfWeek.map((day) => ({
      day,
      open: false,
      openTime: "09:00",
      closeTime: "17:00",
    }))
  );

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

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {hours.map((dayConfig, i) => (
        <Card key={dayConfig.day}>
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Label className="font-medium">{dayConfig.day}</Label>
              <Switch
                checked={dayConfig.open}
                onCheckedChange={(val) => updateDay(i, "open", val)}
              />
            </div>

            {dayConfig.open && (
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
            )}
          </CardContent>
        </Card>
      ))}

      <Button
        className="w-fit"
        onClick={() => console.log("Business Hours:", hours)}
      >
        Save Hours
      </Button>
    </div>
  );
}
