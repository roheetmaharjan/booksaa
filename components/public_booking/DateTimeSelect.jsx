"use client";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, MapPin, Monitor } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const days = [
  { date: 5, day: "Wed" },
  { date: 6, day: "Thu" },
  { date: 7, day: "Fri" },
  { date: 8, day: "Sat" },
  { date: 9, day: "Sun" },
  { date: 10, day: "Mon" },
  { date: 11, day: "Tue" },
];

const times = ["9:00a", "9:15a", "9:30a", "9:45a", "10:00a", "10:15a", "10:30a", "10:45a"];

const availableDays = [0, 1, 2, 4, 5];

const instructors = [
  {
    name: "Dr. Sarah Jenkins",
    role: "Lead Instructor",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
  },
  {
    name: "Dr. Michael Chen",
    role: "Instructor",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
  },
];

export default function DateTimeSelect({ onContinue, onBack }) {
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedTime, setSelectedTime] = useState("10:00a");
  const [selectedInstructor, setSelectedInstructor] = useState(instructors[0]);
  const [location, setLocation] = useState("Chicago");

  const selectedDate = useMemo(() => days[selectedDay], [selectedDay]);

  const handleSlotClick = (dayIndex, time) => {
    if (!availableDays.includes(dayIndex)) return;

    setSelectedDay(dayIndex);
    setSelectedTime(time);
  };
  return (
    <>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Select a Date & Time</h1>
        </div>
      </div>

      {/* Date and Time */}
      <div className="h-full space-y-2 overflow-y-auto">
        <Card className="w-full max-w-xl rounded-3xl border-slate-100 bg-white shadow-xl shadow-slate-200/60">
          <CardContent className="p-6 md:p-8">
            {/* Service */}
            <div className="mb-6 flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 transition-colors hover:bg-slate-50">
              <div className="flex items-center gap-3.5">
                <div className="relative flex h-10 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-300 bg-slate-200/90">
                  <Monitor className="h-6 w-6 text-slate-600 stroke-[1.75]" />

                  <span className="absolute inset-x-0 bottom-0 bg-slate-800 py-0.5 text-center text-[9px] font-bold leading-none text-white">50min</span>
                </div>

                <div>
                  <h3 className="text-sm font-bold leading-snug text-slate-900">Intro to neural networks</h3>

                  <p className="text-xs font-medium text-slate-400">Introduction to networks</p>
                </div>
              </div>

              <div className="pr-1 text-base font-bold text-slate-900">$48</div>
            </div>

            {/* Filters / Navigation */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Instructor */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-auto gap-2.5 rounded-xl border-slate-200/90 bg-white px-3 py-1.5 shadow-sm hover:bg-slate-50">
                      <Avatar className="h-6 w-6 border border-slate-200">
                        <AvatarImage src={selectedInstructor.avatar} alt={selectedInstructor.name} />
                        <AvatarFallback>{selectedInstructor.name.charAt(0)}</AvatarFallback>
                      </Avatar>

                      <div className="text-left leading-none">
                        <span className="block text-xs font-bold text-slate-800">{selectedInstructor.name}</span>

                        <span className="mt-0.5 block text-[10px] font-medium text-slate-400">{selectedInstructor.role}</span>
                      </div>

                      <ChevronDown className="ml-0.5 h-3.5 w-3.5 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="start">
                    {instructors.map((instructor) => (
                      <DropdownMenuItem key={instructor.name} onClick={() => setSelectedInstructor(instructor)}>
                        <Avatar className="mr-2 h-6 w-6">
                          <AvatarImage src={instructor.avatar} />
                          <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
                        </Avatar>

                        {instructor.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Location */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-auto gap-2 rounded-xl border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />

                      {location}

                      <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent>
                    {["Chicago", "New York", "Los Angeles"].map((city) => (
                      <DropdownMenuItem key={city} onClick={() => setLocation(city)}>
                        {city}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Week Navigation */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold tracking-tight text-slate-700">5 - 11 May, 2021</span>

                <div className="inline-flex overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none border-r border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-800" aria-label="Previous week">
                    <ChevronLeft className="h-3.5 w-3.5 stroke-[2.5]" />
                  </Button>

                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-none text-slate-400 hover:bg-slate-50 hover:text-slate-800" aria-label="Next week">
                    <ChevronRight className="h-3.5 w-3.5 stroke-[2.5]" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Calendar */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] table-fixed border-collapse text-center">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/50">
                      {days.map((day, index) => {
                        const isSelected = selectedDay === index;

                        return (
                          <th key={day.date} className="relative px-1 py-3 font-semibold">
                            <span className={`block text-sm font-bold ${isSelected ? "text-[#ff3366]" : "text-slate-700"}`}>{day.date}</span>

                            <span className={`mt-0.5 block text-[10px] font-bold uppercase tracking-wider ${isSelected ? "text-[#ff3366]" : "text-slate-400"}`}>{day.day}</span>

                            {isSelected && <span className="mx-auto mt-1 block h-1.5 w-1.5 rounded-full bg-[#ff3366]" />}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                    {times.map((time) => (
                      <tr key={time}>
                        {days.map((_, dayIndex) => {
                          const isAvailable = availableDays.includes(dayIndex);

                          const isSelected = selectedDay === dayIndex && selectedTime === time;

                          return (
                            <td key={`${dayIndex}-${time}`} className="px-1 py-2.5">
                              {!isAvailable ? (
                                <span className="text-slate-300">—</span>
                              ) : (
                                <button type="button" onClick={() => handleSlotClick(dayIndex, time)} className={`rounded-lg px-2.5 py-1 transition-colors ${isSelected ? "bg-[#ff3366] font-bold text-white shadow-sm shadow-[#ff3366]/30" : "font-medium text-[#ff3366] hover:bg-[#fff0f3]"}`}>
                                  {time}
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Selected value */}
            <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <div>
                <p className="text-[11px] font-medium text-slate-400">Selected appointment</p>

                <p className="text-sm font-bold text-slate-800">
                  {selectedDate.day}, May {selectedDate.date} at {selectedTime}
                </p>
              </div>

              <Button className="rounded-xl bg-[#ff3366] px-4 hover:bg-[#e62457]">Continue</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom */}
      <div className="mt-5 flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" onClick={onBack}>
          <ChevronLeft size={14} />
          Back
        </Button>

        <Button type="button" onClick={onContinue}>
          Continue
          <ChevronRight size={14} />
        </Button>
      </div>
    </>
  );
}
