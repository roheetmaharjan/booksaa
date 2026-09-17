export function filterDueBookings(bookings = [], date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return (bookings || [])
    .filter((booking) => {
      const scheduledAt = booking?.scheduledAt ? new Date(booking.scheduledAt) : null;
      if (!scheduledAt || Number.isNaN(scheduledAt.getTime())) return false;
      return scheduledAt >= start && scheduledAt < end;
    })
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
}
