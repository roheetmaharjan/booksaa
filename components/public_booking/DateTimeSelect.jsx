"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, LoaderCircle } from "lucide-react";

import { api } from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { ChevronDown } from "lucide-react";

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonday(date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);

  const day = result.getDay();
  result.setDate(result.getDate() - (day === 0 ? 6 : day - 1));

  return result;
}

function getMinutes(time) {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (!match) return Number.MAX_SAFE_INTEGER;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3].toUpperCase();

  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  return hour * 60 + minute;
}

export default function DateTimeSelect({ slug, locationId, serviceId, onContinue, onBack }) {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [selectedTime, setSelectedTime] = useState("");
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [professionals, setProfessionals] = useState([]);
  const [professionalId, setProfessionalId] = useState("");
  const [professionalsLoading, setProfessionalsLoading] = useState(false);
  const [professionalsError, setProfessionalsError] = useState("");

  const selectedProfessional = professionals.find((professional) => professional.id === professionalId);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);

      return {
        date,
        key: formatDate(date),
        day: date.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        number: date.getDate(),
      };
    });
  }, [weekStart]);

  const selectedDateKey = formatDate(selectedDate);
  const selectedSlots = availability[selectedDateKey] ?? [];

  // Fetch availability for each day displayed in the calendar.
  useEffect(() => {
    if (!slug || !locationId || !serviceId || !professionalId) {
      setAvailability({});
      return;
    }

    let cancelled = false;

    async function fetchAvailability() {
      setLoading(true);
      setError("");

      try {
        const results = await Promise.all(
          days.map(async (day) => {
            const query = new URLSearchParams({
              locationId,
              serviceId,
              professionalId,
              date: day.key,
            });

            const response = await api.get(`/api/public/bookings/${slug}/availability?${query.toString()}`);
            const body = response;

            if (!body?.success) {
              throw new Error(body?.message || `Could not load availability for ${day.key}`);
            }

            return {
              date: day.key,
              slots: body.data?.slots ?? [],
            };
          }),
        );

        if (!cancelled) {
          const nextAvailability = {};

          results.forEach(({ date, slots }) => {
            nextAvailability[date] = slots;
          });

          setAvailability(nextAvailability);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load available times.");
          setAvailability({});
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchAvailability();

    return () => {
      cancelled = true;
    };
  }, [slug, locationId, serviceId, professionalId, days]);

  useEffect(() => {
    if (!slug || !locationId || !serviceId) {
      setProfessionals([]);
      setProfessionalId("");
      return;
    }

    let cancelled = false;

    async function fetchProfessionals() {
      setProfessionalsLoading(true);
      setProfessionalsError("");

      try {
        const query = new URLSearchParams({
          locationId,
          serviceId,
        });

        const response = await api.get(`/api/public/bookings/${slug}/professionals?${query.toString()}`);

        const body = response;

        if (!body.success) {
          throw new Error(body.message || "Unable to load professionals");
        }

        if (!cancelled) {
          const list = body.data?.professionals ?? [];

          setProfessionals(list);

          setProfessionalId((currentId) => (list.some((item) => item.id === currentId) ? currentId : list[0]?.id ?? ""));
        }
      } catch (error) {
        if (!cancelled) {
          setProfessionals([]);
          setProfessionalId("");
          setProfessionalsError(error.message || "Unable to load professionals");
          console.error("Failed to load professionals:", error);
        }
      } finally {
        if (!cancelled) {
          setProfessionalsLoading(false);
        }
      }
    }

    fetchProfessionals();

    return () => {
      cancelled = true;
    };
  }, [slug, locationId, serviceId]);

  // Reset the selected time if the user changes dates.
  useEffect(() => {
    setSelectedTime("");
  }, [selectedDateKey, professionalId, serviceId, locationId]);

  const times = useMemo(() => {
    const allTimes = new Set();

    Object.values(availability).forEach((slots) => {
      slots.forEach((slot) => allTimes.add(slot.time));
    });

    return Array.from(allTimes).sort((a, b) => getMinutes(a) - getMinutes(b));
  }, [availability]);

  const selectedSlot = selectedSlots.find((slot) => slot.time === selectedTime && slot.available);

  const handlePreviousWeek = () => {
    setWeekStart((previous) => {
      const next = new Date(previous);
      next.setDate(next.getDate() - 7);

      setSelectedDate(next);
      return next;
    });
  };

  const handleNextWeek = () => {
    setWeekStart((previous) => {
      const next = new Date(previous);
      next.setDate(next.getDate() + 7);

      setSelectedDate(next);
      return next;
    });
  };

  const handleContinue = () => {
    console.log(appointment);
    if (!selectedSlot || !selectedProfessional) return;

    onContinue?.({
      date: selectedDateKey,
      time: selectedTime,
      locationId,
      serviceId,
      professionalId: selectedProfessional.id,
      professionalName: selectedProfessional.name,
    });
  };

  const weekEnd = days[6]?.date;

  const weekLabel = weekEnd
    ? `${days[0].date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      })} – ${weekEnd.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}`
    : "";

  return (
    <>
      <div className="mb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Select a Date &amp; Time</h1>
        <p className="mt-1 text-sm text-slate-500">Choose an available appointment slot.</p>
      </div>

      {professionalsError && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {professionalsError}
        </p>
      )}

      <div className="space-y-3">
        <Card className="w-full border-none shadow-none">
          <CardContent className="!p-0">
            {/* Calendar header */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" disabled={professionalsLoading || professionals.length === 0} className="h-auto gap-3 rounded-xl border-slate-200 bg-white px-3 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{selectedProfessional?.name?.charAt(0) ?? "P"}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 text-left">
                      <span className="block text-sm font-semibold">{professionalsLoading ? "Loading professionals..." : selectedProfessional?.name ?? "Select professional"}</span>
                      <span className="block text-xs text-slate-400">Choose your professional</span>
                    </div>

                    <ChevronDown className="h-4 w-4 shrink-0" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" className="w-64">
                  {professionals.map((professional) => (
                    <DropdownMenuItem key={professional.id} onSelect={() => setProfessionalId(professional.id)} className="gap-3 py-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{professional.name.charAt(0)}</AvatarFallback>
                      </Avatar>

                      <span>{professional.name}</span>

                      {professional.id === professionalId && <span className="ml-auto text-primary">✓</span>}
                    </DropdownMenuItem>
                  ))}

                  {!professionalsLoading && professionals.length === 0 && <DropdownMenuItem disabled>No professionals available</DropdownMenuItem>}
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700">{weekLabel}</span>

                <div className="inline-flex overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-none border-r" onClick={handlePreviousWeek} aria-label="Previous week">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={handleNextWeek} aria-label="Next week">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
                <Button
                  type="button"
                  variant="link"
                  className="ml-2 h-auto p-0 text-red-700"
                  onClick={() => {
                    // Changing the week triggers a fresh availability request.
                    setWeekStart((previous) => new Date(previous));
                  }}
                >
                  Try again
                </Button>
              </div>
            )}

            {/* Calendar */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] table-fixed border-collapse text-center">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70">
                      {days.map((day) => {
                        const isSelected = selectedDateKey === day.key;

                        return (
                          <th key={day.key} className="px-1 py-3">
                            <button type="button" onClick={() => setSelectedDate(day.date)} className={`mx-auto flex min-w-10 flex-col items-center rounded-lg px-2 py-1 ${isSelected ? "bg-primary text-slate-800" : "text-slate-700 hover:bg-slate-100"}`}>
                              <span className="text-sm font-bold">{day.number}</span>
                              <span className="mt-0.5 text-[10px] font-bold uppercase">{day.day}</span>
                            </button>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 text-xs">
                    {loading && times.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-slate-500">
                          <LoaderCircle className="mx-auto mb-2 h-5 w-5 animate-spin" />
                          Loading availability...
                        </td>
                      </tr>
                    ) : times.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-sm text-slate-500">
                          No available time slots found.
                        </td>
                      </tr>
                    ) : (
                      times.map((time) => (
                        <tr key={time}>
                          {days.map((day) => {
                            const slot = (availability[day.key] ?? []).find((item) => item.time === time);

                            const isAvailable = slot?.available === true;
                            const isSelected = selectedDateKey === day.key && selectedTime === time && isAvailable;

                            return (
                              <td key={`${day.key}-${time}`} className="px-1 py-2.5">
                                {!slot || !isAvailable ? (
                                  <span className="text-slate-300">—</span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedDate(day.date);
                                      setSelectedTime(time);
                                    }}
                                    className={`rounded-lg px-2 py-1.5 transition-colors ${isSelected ? "bg-primary font-bold text-primary-foreground" : "font-medium text-slate-800 hover:bg-slate-100"}`}
                                  >
                                    {time}
                                  </button>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Selected appointment */}
            <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <div>
                <p className="text-[11px] font-medium text-slate-400">Selected appointment</p>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {selectedTime ? ` at ${selectedTime}` : ""}
                </p>
              </div>

              {selectedTime && selectedSlot && <span className="text-xs font-medium text-green-700">Available</span>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom navigation */}
      <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>

        <Button type="button" onClick={handleContinue} disabled={!selectedSlot || !selectedProfessional || loading}>
          Continue
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
