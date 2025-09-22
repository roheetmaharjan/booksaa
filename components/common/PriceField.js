import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function PriceField({ value, onChange, label }) {
  return (
    <div className="grid w-full max-w-sm items-center gap-2">
      <Label htmlFor={label ? `"${label}"`: "Price"}>{ label ? `${label}`: "Price"} <span className="astrick">*</span></Label>
      <div className="flex items-center">
        <span className="px-3 py-[7px] bg-muted text-muted-foreground rounded-l-md border border-r-0">
          $
        </span>
        <Input
          type="number"
          id={label ? `${label}` : "Price"}
          name="price"
          placeholder="Enter price"
          value={value}
          onChange={onChange}
          className="rounded-l-none"
        />
      </div>
    </div>
  )
}
