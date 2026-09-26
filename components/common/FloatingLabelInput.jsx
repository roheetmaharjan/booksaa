"use client"

import React, { useId } from "react"
import { cn } from "@/lib/utils"

export function FloatingLabelInput({ label, className, id, ...props }) {
  const inputId = id || useId()

  return (
    <div className="relative w-full">
      <input
        id={inputId}
        placeholder=" "
        className={cn(
          "peer block w-full rounded-md border border-input bg-transparent px-3 pt-5 pb-2 text-sm text-foreground focus:border-ring focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
      <label
        htmlFor={inputId}
        className="absolute left-3 top-2.5 text-muted-foreground text-sm transition-all
          peer-placeholder-shown:top-4 peer-placeholder-shown:text-muted-foreground peer-placeholder-shown:text-base
          peer-focus:top-2.5 peer-focus:text-sm peer-focus:text-foreground"
      >
        {label}
      </label>
    </div>
  )
}
