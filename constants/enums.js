export const BookingStatus = {
  PENDING: "PENDING",
  DRAFT: "DRAFT",
  PENDING_PAYMENT: "PENDING_PAYMENT",
  CONFIRMED: "CONFIRMED",
  CHECKED_IN: "CHECKED_IN",
  IN_SERVICE: "IN_SERVICE",
  COMPLETED: "COMPLETED",
  CANCELED: "CANCELED",
  PAYMENT_EXPIRED: "PAYMENT_EXPIRED",
};
export const BOOKING_STATUS = Object.values(BookingStatus);

export const PaymentStatus = {
  UNPAID: "UNPAID",
  PARTIALLY_PAID: "PARTIALLY_PAID",
  PAID: "PAID",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
};
export const PAYMENT_STATUS = Object.values(PaymentStatus);

export const UserStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
};
export const USER_STATUS = Object.values(UserStatus);

export const AccountStatus = {
  TRIAL_ACTIVE: "TRIAL_ACTIVE",
  TRIAL_EXPIRING: "TRIAL_EXPIRING",
  TRIAL_EXPIRED: "TRIAL_EXPIRED",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  PENDING: "PENDING",
};
export const ACCOUNT_STATUS = Object.values(AccountStatus);

export const ProfessionalStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  PENDING: "PENDING",
};
export const PROFESSIONAL_STATUS = Object.values(ProfessionalStatus);
