export function isSupportedTimeZone(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}

export function zonedDateTimeToDate(date, time, timeZone) {
  const dateMatch = typeof date === "string" && date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const timeMatch = typeof time === "string" && time.match(/^(\d{2}):(\d{2})$/);
  if (!dateMatch || !timeMatch || !isSupportedTimeZone(timeZone)) return null;

  const [, year, month, day] = dateMatch.map(Number);
  const [, hour, minute] = timeMatch.map(Number);
  const desiredUtc = Date.UTC(year, month - 1, day, hour, minute);
  const desired = [year, month, day, hour, minute];
  if (new Date(desiredUtc).toISOString().slice(0, 10) !== date || hour > 23 || minute > 59) return null;

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  let timestamp = desiredUtc;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = Object.fromEntries(formatter.formatToParts(new Date(timestamp)).map((part) => [part.type, Number(part.value)]));
    const renderedUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
    timestamp += desiredUtc - renderedUtc;
  }

  const result = new Date(timestamp);
  const finalParts = Object.fromEntries(formatter.formatToParts(result).map((part) => [part.type, Number(part.value)]));
  const finalValues = [finalParts.year, finalParts.month, finalParts.day, finalParts.hour, finalParts.minute];
  if (desired.some((value, index) => value !== finalValues[index])) return null;
  return result;
}

export function getZonedDateParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
  }).formatToParts(date);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

export function getZonedDayBounds(date, timeZone) {
  const start = zonedDateTimeToDate(date, "00:00", timeZone);
  if (!start) return null;
  const [year, month, day] = date.split("-").map(Number);
  const nextDate = new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
  const end = zonedDateTimeToDate(nextDate, "00:00", timeZone);
  return end ? { start, end } : null;
}

export function isBookingWithinWindow(scheduledAt, date, settings, timeZone, now = new Date()) {
  const today = getZonedDateParts(now, timeZone);
  const todayKey = `${today.year}-${today.month}-${today.day}`;
  const dayDistance = Math.floor((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${todayKey}T00:00:00Z`)) / 86400000);
  return dayDistance >= 0
    && dayDistance <= settings.maxAdvanceBookingDays
    && scheduledAt.getTime() >= now.getTime() + settings.minAdvanceNoticeMinutes * 60 * 1000;
}
