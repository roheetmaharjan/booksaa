export function Info({ label, value, wide = false }) {
  return (
    <div className={wide ? "col-span-12" : "col-span-12 md:col-span-4"}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "-"}</p>
    </div>
  );
}
