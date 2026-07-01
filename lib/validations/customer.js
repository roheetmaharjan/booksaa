import { isValidPhoneNumber } from "react-phone-number-input";

export function validateCustomer(form) {
  const errors = {};

  if (!form.fullName.trim()) {
    errors.fullName = "Full name is required.";
  }

  if (!form.phone) {
    errors.phone = "Phone number is required.";
  } else if (!isValidPhoneNumber(form.phone)) {
    errors.phone = "Invalid phone number.";
  }

  if (!form.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)) {
    errors.email = "Invalid email address.";
  }

  if (!form.gender) {
    errors.gender = "Gender is required.";
  }
  if (!form.status) {
    errors.status = "Status is required.";
  }

  return errors;
}
