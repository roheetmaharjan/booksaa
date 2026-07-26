export function filterDueBookings(bookings = []) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setDate(end.getDate() + 1);
  end.setHours(23, 59, 59, 999);

  return (bookings || [])
    .filter((booking) => {
      const scheduledAt = booking?.scheduledAt ? new Date(booking.scheduledAt) : null;
      if (!scheduledAt || Number.isNaN(scheduledAt.getTime())) return false;
      return scheduledAt >= start && scheduledAt <= end;
    })
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
}
