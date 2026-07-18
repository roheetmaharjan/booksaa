import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function CustomerSummaryCards({ stats }) {
  const cards = useMemo(
    () => [
      { label: "Total Customers",     value: stats.totalCustomers     || 0 },
      { label: "New This Month",      value: stats.newThisMonth       || 0 },
      { label: "Returning Customers", value: stats.returningCustomers || 0 },
      { label: "VIP Customers",       value: stats.vipCustomers       || 0 },
      { label: "Inactive Customers",  value: stats.inactiveCustomers  || 0 },
      { label: "Birthdays This Month",value: stats.birthdaysThisMonth || 0 },
    ],
    [stats],
  );

  return (
    <div className="grid grid-cols-12 gap-3">
      {cards.map((card) => (
        <Card key={card.label} className="col-span-12 sm:col-span-6 xl:col-span-2">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-1 text-2xl font-bold">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
