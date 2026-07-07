import { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Ban, CalendarPlus, FileSpreadsheet, Mail, MessageSquare, Phone, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "./Avatar";
import { Metric } from "./Metric";
import { Info } from "./Info";
import { EmptyRow } from "./EmptyRow";
import NewAppointment from "@/components/common/NewAppointment";

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const stats = customer.statistics || {};
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bookingStart, setBookingStart] = useState(null);
  const [bookingProfessionalId, setBookingProfessionalId] = useState("");
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  // called by NewAppointment after a booking is successfully created
  const handleBookingSuccess = () => {
    setDialogOpen(false);
    loadBookings();
  };

  // derived
  const locationId = searchParams.get("locationId");
  const locations = vendor?.locations || [];
  const effectiveLocationId = locationId || vendor?.selectedLocationId || vendor?.defaultLocationId || locations[0]?.id || "";
  const professionals = vendor?.professionals || [];
  const services = vendor?.services || [];

  const [openProfessional, setOpenProfessional] = useState(false);
  // RBC resources — one per professional
  const resources = useMemo(
    () =>
      professionals.map((p) => ({
        id: p.id,
        title: p.name,
        roleName: p.role?.name || "",
      })),
    [professionals],
  );

  // load vendor
  useEffect(() => {
    let active = true;
    async function loadVendor() {
      try {
        setLoading(true);
        const currentRes = await fetch("/api/businesses/current", { cache: "no-store" });
        const currentData = await currentRes.json();
        if (!currentRes.ok || !currentData.vendor) {
          toast.error("Failed to load business");
          return;
        }
        const url = effectiveLocationId ? `/api/businesses/${currentData.vendor.id}?locationId=${effectiveLocationId}` : `/api/businesses/${currentData.vendor.id}`;
        const vendorRes = await fetch(url, { cache: "no-store" });
        const vendorData = await vendorRes.json();
        if (!vendorRes.ok) {
          toast.error("Failed to load booking calendar");
          return;
        }
        if (active) setVendor(vendorData);
      } catch (err) {
        console.error(err);
        toast.error("Unable to load booking calendar");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadVendor();
    return () => {
      active = false;
    };
  }, [effectiveLocationId]);

  const openBookingDialog = useCallback(
    (startDate, professionalId = null) => {
      if (!isBookableSlot(startDate)) {
        toast.error("Please choose a future date and time.");
        return;
      }
      setBookingStart(startDate);
      setBookingProfessionalId(professionalId || professionals[0]?.id || "");
      setDialogOpen(true);
    },
    [professionals],
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-row items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <Avatar customer={customer} />
          <div>
            {customer.fullName}
            <span className="block text-sm mt-2 font-normal text-muted-foreground">{customer.customerCode}</span>
          </div>
        </div>
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-12 items-center gap-3">
        <Metric label="Total Visits" value={stats.totalVisits || 0} />
        <Metric label="Total Bookings" value={stats.totalBookings || 0} />
        <Metric label="Lifetime Spending" value={money(stats.lifetimeSpending)} />
        <Metric label="Average Spending" value={money(stats.averageSpending)} />
        <Metric label="Cancelled" value={stats.cancellationCount || 0} />
        <Metric label="No-shows" value={stats.noShowCount || 0} />
      </div>
      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={() => setDialogOpen(true)}>
          <CalendarPlus className="size-4" />
          Book Appointment
        </Button>
        <NewAppointment open={dialogOpen} onOpenChange={setDialogOpen} onBookingSuccess={handleBookingSuccess} initialStart={bookingStart} initialProfessionalId={bookingProfessionalId} professionals={professionals} services={services} onNewCustomer={() => setCustomerCreateOpen(true)} />
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
              <Info label="Phone" value={customer.phone} />
              <Info label="Email" value={customer.email} />
              <Info label="Gender" value={customer.gender} />
              <Info label="Date of Birth" value={formatDate(customer.dateOfBirth)} />
              <Info label="Address" value={customer.address} wide />
              <Info label="Date Joined" value={formatDate(customer.dateJoined)} />
              <Info label="Last Visit" value={formatDateTime(stats.lastVisit)} />
              <Info label="Next Appointment" value={formatDateTime(stats.nextAppointment)} />
              <Info label="Preferred Staff" value={customer.preferredStaffName} />
              <Info label="Preferred Service" value={customer.preferredServiceName} />
              <Info label="Status" value={customer.status} />
            </div>
            <div className="flex flex-wrap gap-1">
              {(customer.tags || []).map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <p className="whitespace-pre-wrap rounded-md border p-3 text-sm text-muted-foreground">{customer.notes || "No general notes."}</p>
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
                    <TableCell>{new Date(booking.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</TableCell>
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
            <Textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)} className="min-h-28" placeholder="Private staff note" />
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
              {!customer.noteEntries?.length && <p className="text-sm text-muted-foreground">No private notes yet.</p>}
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
                {!customer.communications?.length && <EmptyRow colSpan={4} label="No communication history yet." />}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Loyalty tab */}
          <TabsContent value="loyalty">
            <div className="grid grid-cols-12 gap-3">
              <Info label="Loyalty Points" value={customer.loyaltyPoints} />
              <Info label="Earned Points" value={customer.earnedPoints} />
              <Info label="Redeemed Points" value={customer.redeemedPoints} />
              <Info label="Membership Level" value={customer.membershipLevel} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
