import { Ban, CalendarPlus, FileSpreadsheet, Mail, MessageSquare, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "./Avatar";
import { Metric } from "./Metric";
import { Info } from "./Info";
import { EmptyRow } from "./EmptyRow";

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export function CustomerProfile({ customer, noteContent, setNoteContent, addNote, quickAction }) {
  const stats = customer.statistics || {};

  return (
    <div className="flex flex-col gap-5">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          <Avatar customer={customer} />
          <div>
            {customer.fullName}
            <span className="block text-sm mt-2 font-normal text-muted-foreground">{customer.customerCode}</span>
          </div>
        </DialogTitle>
      </DialogHeader>
      {/* Stats row */}
      <div className="grid grid-cols-12 items-center gap-3">
        <Metric label="Total Visits"      value={stats.totalVisits      || 0} />
        <Metric label="Total Bookings"    value={stats.totalBookings    || 0} />
        <Metric label="Lifetime Spending" value={money(stats.lifetimeSpending)} />
        <Metric label="Average Spending"  value={money(stats.averageSpending)} />
        <Metric label="Cancelled"         value={stats.cancellationCount || 0} />
        <Metric label="No-shows"          value={stats.noShowCount       || 0} />
      </div>
      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={() => quickAction("book")}>
          <CalendarPlus className="size-4" />
          Book Appointment
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => quickAction("call")}>
          <Phone className="size-4" />
          Call
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => quickAction("sms")}>
          <MessageSquare className="size-4" />
          SMS
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => quickAction("email")}>
          <Mail className="size-4" />
          Email
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => quickAction("invoice")}>
          <FileSpreadsheet className="size-4" />
          Create Invoice
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => quickAction("blocked")}>
          <Ban className="size-4" />
          Add Note
        </Button>
      </div>
      <div className="max-h-6xl overflow-y-auto">
        {/* Tabs */}
        <Tabs defaultValue="profile">
          <TabsList className="flex h-auto flex-wrap">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
          </TabsList>

          {/* Profile tab */}
          <TabsContent value="profile" className="space-y-4">
            <div className="grid grid-cols-12 gap-3">
              <Info label="Phone"              value={customer.phone} />
              <Info label="Email"              value={customer.email} />
              <Info label="Gender"             value={customer.gender} />
              <Info label="Date of Birth"      value={formatDate(customer.dateOfBirth)} />
              <Info label="Address"            value={customer.address} wide />
              <Info label="Date Joined"        value={formatDate(customer.dateJoined)} />
              <Info label="Last Visit"         value={formatDateTime(stats.lastVisit)} />
              <Info label="Next Appointment"   value={formatDateTime(stats.nextAppointment)} />
              <Info label="Preferred Staff"    value={customer.preferredStaffName} />
              <Info label="Preferred Service"  value={customer.preferredServiceName} />
              <Info label="Status"             value={customer.status} />
            </div>
            <div className="flex flex-wrap gap-1">
              {(customer.tags || []).map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
            <p className="whitespace-pre-wrap rounded-md border p-3 text-sm text-muted-foreground">
              {customer.notes || "No general notes."}
            </p>
          </TabsContent>

          {/* Bookings tab */}
          <TabsContent value="bookings">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(customer.bookings || []).map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{formatDate(booking.scheduledAt)}</TableCell>
                    <TableCell>
                      {new Date(booking.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </TableCell>
                    <TableCell>{booking.service?.name || "-"}</TableCell>
                    <TableCell>{booking.professional?.name || "-"}</TableCell>
                    <TableCell>{money(booking.paymentAmount || booking.service?.price)}</TableCell>
                    <TableCell>{booking.status}</TableCell>
                  </TableRow>
                ))}
                {!customer.bookings?.length && <EmptyRow colSpan={6} label="No booking history yet." />}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Invoices tab */}
          <TabsContent value="invoices">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(customer.invoices || []).map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.purchasedServices || "-"}</TableCell>
                    <TableCell>{invoice.productsPurchased || "-"}</TableCell>
                    <TableCell>{money(invoice.totalAmount)}</TableCell>
                    <TableCell>{money(invoice.paidAmount)}</TableCell>
                    <TableCell>{invoice.paymentMethod || "-"}</TableCell>
                    <TableCell>{money(invoice.outstandingBalance)}</TableCell>
                  </TableRow>
                ))}
                {!customer.invoices?.length && <EmptyRow colSpan={7} label="No invoices yet." />}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Notes tab */}
          <TabsContent value="notes" className="space-y-3">
            <Textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="min-h-28"
              placeholder="Private staff note"
            />
            <Button type="button" onClick={addNote}>
              Add Note
            </Button>
            <div className="space-y-2">
              {(customer.noteEntries || []).map((note) => (
                <div key={note.id} className="rounded-md border p-3">
                  <p className="whitespace-pre-wrap text-sm">{note.content}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {note.staffName || "Staff"} at {formatDateTime(note.createdAt)}
                  </p>
                </div>
              ))}
              {!customer.noteEntries?.length && (
                <p className="text-sm text-muted-foreground">No private notes yet.</p>
              )}
            </div>
          </TabsContent>

          {/* Communication tab */}
          <TabsContent value="communication">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(customer.communications || []).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.subject || "-"}</TableCell>
                    <TableCell>{item.message || "-"}</TableCell>
                    <TableCell>{formatDateTime(item.createdAt)}</TableCell>
                  </TableRow>
                ))}
                {!customer.communications?.length && (
                  <EmptyRow colSpan={4} label="No communication history yet." />
                )}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Loyalty tab */}
          <TabsContent value="loyalty">
            <div className="grid grid-cols-12 gap-3">
              <Info label="Loyalty Points"   value={customer.loyaltyPoints} />
              <Info label="Earned Points"    value={customer.earnedPoints} />
              <Info label="Redeemed Points"  value={customer.redeemedPoints} />
              <Info label="Membership Level" value={customer.membershipLevel} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
