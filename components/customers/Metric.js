import { Card, CardContent } from "@/components/ui/card";

export function Metric({ label, value }) {
  return (
    <Card className="col-span-6 md:col-span-4 xl:col-span-2">
      <CardContent className="p-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-lg font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
