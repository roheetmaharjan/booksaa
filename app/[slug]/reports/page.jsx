"use client";

import {
  BarChart3,
  CalendarDays,
  CreditCard,
  DollarSign,
  MoreHorizontal,
  Users,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const paymentData = [
  { method: "Cash", amount: "$620.00", percentage: 50 },
  { method: "Card", amount: "$450.00", percentage: 36 },
  { method: "Payment Link", amount: "$170.00", percentage: 14 },
];

const services = [
  { name: "Haircut", bookings: 14, revenue: "$420.00" },
  { name: "Hair Color", bookings: 6, revenue: "$360.00" },
  { name: "Facial", bookings: 4, revenue: "$240.00" },
  { name: "Hair Wash", bookings: 3, revenue: "$90.00" },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your sales and appointment activity.
          </p>
        </div>

        <Select defaultValue="today">
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="yesterday">Yesterday</SelectItem>
            <SelectItem value="week">This week</SelectItem>
            <SelectItem value="month">This month</SelectItem>
            <SelectItem value="custom">Custom range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-4">
        <SummaryCard
          title="Revenue"
          value="$1,240.00"
          description="+12.5% from yesterday"
          icon={DollarSign}
        />

        <SummaryCard
          title="Appointments"
          value="24"
          description="18 completed"
          icon={CalendarDays}
        />

        <SummaryCard
          title="Payments"
          value="$1,060.00"
          description="$180.00 outstanding"
          icon={CreditCard}
        />

        <SummaryCard
          title="Customers"
          value="21"
          description="3 new customers"
          icon={Users}
        />
      </div>

      {/* Revenue + Appointments */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium">
                Revenue overview
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Revenue generated during the selected period.
              </p>
            </div>

            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent>
            <div className="flex h-[220px] items-end gap-3 border-b px-2 pb-0">
              {[45, 65, 52, 78, 60, 88, 72, 95, 68, 82, 74, 100].map(
                (height, index) => (
                  <div
                    key={index}
                    className="group flex h-full flex-1 items-end"
                  >
                    <div
                      className="w-full rounded-t-md bg-primary/15 transition-colors group-hover:bg-primary/30"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                )
              )}
            </div>

            <div className="mt-3 flex justify-between text-xs text-muted-foreground">
              <span>9 AM</span>
              <span>12 PM</span>
              <span>3 PM</span>
              <span>6 PM</span>
              <span>9 PM</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Appointments
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Today's appointment breakdown.
            </p>
          </CardHeader>

          <CardContent className="space-y-5">
            <AppointmentStat
              label="Completed"
              value="18"
              percentage="75%"
            />

            <AppointmentStat
              label="Upcoming"
              value="4"
              percentage="17%"
            />

            <AppointmentStat
              label="Canceled"
              value="2"
              percentage="8%"
            />
          </CardContent>
        </Card>
      </div>

      {/* Payment + Services */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Payments
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Revenue collected by payment method.
            </p>
          </CardHeader>

          <CardContent className="space-y-5">
            {paymentData.map((payment) => (
              <div key={payment.method}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>{payment.method}</span>
                  <span className="font-medium">{payment.amount}</span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${payment.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium">
                Top services
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Best performing services.
              </p>
            </div>

            <Button variant="ghost" size="icon">
              <BarChart3 className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead className="text-right">Bookings</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.name}>
                    <TableCell className="font-medium">
                      {service.name}
                    </TableCell>
                    <TableCell className="text-right">
                      {service.bookings}
                    </TableCell>
                    <TableCell className="text-right">
                      {service.revenue}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, description, icon: Icon }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{title}</p>

          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="mt-3">
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AppointmentStat({ label, value, percentage }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: percentage }}
        />
      </div>
    </div>
  );
}