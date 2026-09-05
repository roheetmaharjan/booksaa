import { BookingStatus } from "@/constants/enums";

export const STAGES = [
  {
    id: "unconfirmed",
    label: "Unconfirmed",
    statuses: [BookingStatus.PENDING, BookingStatus.PENDING_PAYMENT],
  },
  {
    id: "confirmed",
    label: "Confirmed",
    statuses: [BookingStatus.CONFIRMED],
  },
  {
    id: "arrived",
    label: "Arrived",
    statuses: [BookingStatus.CHECKED_IN],
  },
  {
    id: "in_service",
    label: "In Service",
    statuses: [BookingStatus.IN_SERVICE],
  },
  {
    id: "completed",
    label: "Completed",
    statuses: [BookingStatus.COMPLETED],
  },
];

const svc = (id, name, staff, price, duration = 30) => ({
  id,
  name,
  staff,
  price,
  duration,
});

export const currency = (n) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

export const initials = (name) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
