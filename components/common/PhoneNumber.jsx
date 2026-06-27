"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import PhoneInput, { isPossiblePhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

import { cn } from "@/lib/utils";

export function PhoneNumberInput({
  className,
  value,
  onChange,
  defaultCountry = "NP",
  ...props
}) {
  return (
    <div className="relative">
      <PhoneInput
        international
        defaultCountry={defaultCountry}
        value={value}
        onChange={onChange}
        className={cn("phone-input", className)}
        {...props}
      />
      <span className="absolute top-2 right-2">
        {value ? (
          isPossiblePhoneNumber(value) ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )
        ) : null}
      </span>
    </div>
  );
}