"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Ban,
  CalendarPlus,
  Download,
  FileSpreadsheet,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Upload,
  UserRound,
} from "lucide-react";

import Loading from "@/components/common/Loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@/hooks/useMutation";

const emptyCustomer = {
  fullName: "",
  phone: "",
  email: "",
  gender: "",
  dateOfBirth: "",
  address: "",
  profilePhoto: "",
  notes: "",
  status: "ACTIVE",
  tags: "",
  preferredStaffName: "",
  preferredServiceName: "",
  loyaltyPoints: 0,
  earnedPoints: 0,
  redeemedPoints: 0,
  membershipLevel: "",
};

const statusTone = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  INACTIVE: "bg-slate-50 text-slate-700 border-slate-200",
  BLOCKED: "bg-red-50 text-red-700 border-red-200",
};

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

function tagsToString(tags) {
  return Array.isArray(tags) ? tags.join(", ") : tags || "";
}

function initials(name) {
  return String(name || "Customer")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function encodeQuery(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, value);
  });
  return query.toString();
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState(emptyCustomer);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [duplicateState, setDuplicateState] = useState(null);
  const [noteContent, setNoteContent] = useState("");
  const [importFile, setImportFile] = useState(null);
  const [importDuplicates, setImportDuplicates] = useState([]);

  const { mutate: createCustomer, loading: savingCustomer } = useMutation("/api/customers", { method: "POST" });

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const qs = encodeQuery({ q: query, status, sort, page, pageSize: pagination.pageSize });
      const res = await fetch(`/api/customers?${qs}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to load customers.");
      setCustomers(data.customers || []);
      setStats(data.stats || {});
      setPagination(data.pagination || { page, pageSize: 10, total: 0, totalPages: 1 });
    } catch (error) {
      toast.error(error.message || "Unable to load customers.");
    } finally {
      setLoading(false);
    }
  }, [page, pagination.pageSize, query, sort, status]);

  useEffect(() => {
    const timer = setTimeout(loadCustomers, 250);
    return () => clearTimeout(timer);
  }, [loadCustomers]);

  const loadProfile = async (id) => {
    setProfileLoading(true);
    try {
      const res = await fetch(`/api/customers/${id}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to load customer profile.");
      setSelectedCustomer(data.customer);
      setProfileOpen(true);
    } catch (error) {
      toast.error(error.message || "Unable to load customer profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const summaryCards = useMemo(
    () => [
      { label: "Total Customers", value: stats.totalCustomers || 0 },
      { label: "New This Month", value: stats.newThisMonth || 0 },
      { label: "Returning Customers", value: stats.returningCustomers || 0 },
      { label: "VIP Customers", value: stats.vipCustomers || 0 },
      { label: "Inactive Customers", value: stats.inactiveCustomers || 0 },
      { label: "Birthdays This Month", value: stats.birthdaysThisMonth || 0 },
    ],
    [stats],
  );

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setCustomerForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetCreate = () => {
    setCustomerForm(emptyCustomer);
    setDuplicateState(null);
  };

  const submitCustomer = async (ignoreDuplicate = false) => {
    try {
      const payload = {
        ...customerForm,
        tags: customerForm.tags,
        ignoreDuplicate,
      };
      await createCustomer(payload);
      toast.success("Customer created.");
      setCreateOpen(false);
      resetCreate();
      loadCustomers();
    } catch (error) {
      if (error.message === "Possible duplicate customer.") {
        setDuplicateState({ message: error.message });
        toast.error("Possible duplicate customer.");
        return;
      }
      toast.error(error.message || "Unable to create customer.");
    }
  };

  const quickAction = (type) => {
    if (!selectedCustomer) return;
    if (type === "call" && selectedCustomer.phone) window.location.href = `tel:${selectedCustomer.phone}`;
    else if (type === "sms" && selectedCustomer.phone) window.location.href = `sms:${selectedCustomer.phone}`;
    else if (type === "email" && selectedCustomer.email) window.location.href = `mailto:${selectedCustomer.email}`;
    else if (type === "book") window.location.href = `/business/calendar?customerId=${selectedCustomer.id}`;
    else toast.info("This action is ready for the next integration.");
  };

  const addNote = async () => {
    if (!selectedCustomer || !noteContent.trim()) {
      toast.error("Write a note first.");
      return;
    }

    try {
      const res = await fetch(`/api/customers/${selectedCustomer.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: noteContent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to add note.");
      setNoteContent("");
      toast.success("Note added.");
      await loadProfile(selectedCustomer.id);
    } catch (error) {
      toast.error(error.message || "Unable to add note.");
    }
  };

  const importCustomers = async (ignoreDuplicates = false) => {
    if (!importFile) {
      toast.error("Choose a CSV file first.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", importFile);
      formData.append("ignoreDuplicates", String(ignoreDuplicates));
      const res = await fetch("/api/customers/import", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed.");
      setImportDuplicates(data.duplicates || []);
      toast.success(`${data.imported?.length || 0} customers imported.`);
      if (!data.duplicates?.length) setImportOpen(false);
      loadCustomers();
    } catch (error) {
      toast.error(error.message || "Import failed.");
    }
  };

  const exportCustomers = (format) => {
    window.location.href = `/api/customers/export?format=${format}`;
  };

  return (
    <div className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="page-title">Customers</h4>
            <p className="text-sm text-muted-foreground">Manage customer profiles, history, notes, tags, loyalty, and communication records.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setImportOpen(true)}>
              <Upload className="size-4" />
              Import
            </Button>
            <Button type="button" variant="outline" onClick={() => exportCustomers("csv")}>
              <Download className="size-4" />
              CSV
            </Button>
            <Button type="button" variant="outline" onClick={() => exportCustomers("excel")}>
              <FileSpreadsheet className="size-4" />
              Excel
            </Button>
            <Button type="button" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Add Customer
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-3">
          {summaryCards.map((card) => (
            <Card key={card.label} className="col-span-12 sm:col-span-6 xl:col-span-2">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="mt-1 text-2xl font-bold">{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="gap-3">
            <CardTitle className="text-lg">Customer List</CardTitle>
            <div className="grid grid-cols-12 gap-2">
              <div className="relative col-span-12 lg:col-span-6">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => {
                    setPage(1);
                    setQuery(event.target.value);
                  }}
                  placeholder="Search by name, phone, or email"
                  className="pl-9"
                />
              </div>
              <Select
                value={status}
                onValueChange={(value) => {
                  setPage(1);
                  setStatus(value);
                }}
              >
                <SelectTrigger className="col-span-6 lg:col-span-3">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="BLOCKED">Blocked</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="col-span-6 lg:col-span-3">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest visit</SelectItem>
                  <SelectItem value="alpha">Alphabetically</SelectItem>
                  <SelectItem value="created">Newest customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loading />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Last Visit</TableHead>
                      <TableHead className="text-right">Spend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id} className="cursor-pointer" onClick={() => loadProfile(customer.id)}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar customer={customer} />
                            <div>
                              <p className="font-medium">{customer.fullName}</p>
                              <p className="text-xs text-muted-foreground">{customer.customerCode}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{customer.phone || "-"}</TableCell>
                        <TableCell>{customer.email || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusTone[customer.status] || ""}>
                            {customer.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex max-w-52 flex-wrap gap-1">
                            {(customer.tags || []).slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(customer.lastVisit)}</TableCell>
                        <TableCell className="text-right">{money(customer.lifetimeSpending)}</TableCell>
                      </TableRow>
                    ))}
                    {customers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                          No customers found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground">
                    Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} customers)
                  </p>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" disabled={page <= 1} onClick={() => setPage((value) => Math.max(value - 1, 1))}>
                      Previous
                    </Button>
                    <Button type="button" variant="outline" disabled={page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)}>
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={createOpen} onOpenChange={(open) => {
        setCreateOpen(open);
        if (!open) resetCreate();
      }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add customer</DialogTitle>
          </DialogHeader>
          {duplicateState && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              A customer with the same phone or email may already exist. Review before creating, or ignore to create anyway.
            </div>
          )}
          <CustomerForm form={customerForm} onChange={handleFormChange} setForm={setCustomerForm} />
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            {duplicateState && (
              <Button type="button" variant="outline" disabled={savingCustomer} onClick={() => submitCustomer(true)}>
                Ignore Duplicate
              </Button>
            )}
            <Button type="button" disabled={savingCustomer} onClick={() => submitCustomer(false)}>
              {savingCustomer ? "Saving..." : "Save Customer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import customers</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="customer-csv">CSV file</Label>
            <Input id="customer-csv" type="file" accept=".csv,text/csv" onChange={(event) => setImportFile(event.target.files?.[0] || null)} />
            <p className="text-sm text-muted-foreground">Headers supported: Name, Phone, Email, Address, Notes.</p>
            {importDuplicates.length > 0 && (
              <div className="max-h-48 overflow-y-auto rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">
                <p className="font-medium text-amber-900">{importDuplicates.length} possible duplicates found.</p>
                {importDuplicates.slice(0, 5).map((item) => (
                  <p key={item.row} className="text-amber-800">
                    Row {item.row}: {item.customer.fullName}
                  </p>
                ))}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setImportOpen(false)}>
              Cancel
            </Button>
            {importDuplicates.length > 0 && (
              <Button type="button" variant="outline" onClick={() => importCustomers(true)}>
                Import Duplicates
              </Button>
            )}
            <Button type="button" onClick={() => importCustomers(false)}>
              Import CSV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-5xl">
          {profileLoading || !selectedCustomer ? (
            <Loading />
          ) : (
            <CustomerProfile customer={selectedCustomer} noteContent={noteContent} setNoteContent={setNoteContent} addNote={addNote} quickAction={quickAction} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Avatar({ customer }) {
  if (customer.profilePhoto) {
    return <img src={customer.profilePhoto} alt={customer.fullName} className="size-10 rounded-md object-cover" />;
  }
  return <span className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-sm font-bold text-primary">{initials(customer.fullName)}</span>;
}

function CustomerForm({ form, onChange, setForm }) {
  return (
    <div className="grid grid-cols-12 gap-3">
      <div className="col-span-12 md:col-span-6">
        <Label>Full Name</Label>
        <Input name="fullName" value={form.fullName} onChange={onChange} />
      </div>
      <div className="col-span-12 md:col-span-3">
        <Label>Phone</Label>
        <Input name="phone" value={form.phone} onChange={onChange} />
      </div>
      <div className="col-span-12 md:col-span-3">
        <Label>Email</Label>
        <Input name="email" type="email" value={form.email} onChange={onChange} />
      </div>
      <div className="col-span-12 md:col-span-3">
        <Label>Gender</Label>
        <Input name="gender" value={form.gender} onChange={onChange} />
      </div>
      <div className="col-span-12 md:col-span-3">
        <Label>Date of Birth</Label>
        <Input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={onChange} />
      </div>
      <div className="col-span-12 md:col-span-3">
        <Label>Status</Label>
        <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="BLOCKED">Blocked</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-12 md:col-span-3">
        <Label>Profile Photo URL</Label>
        <Input name="profilePhoto" value={form.profilePhoto} onChange={onChange} />
      </div>
      <div className="col-span-12">
        <Label>Address</Label>
        <Input name="address" value={form.address} onChange={onChange} />
      </div>
      <div className="col-span-12 md:col-span-6">
        <Label>Tags</Label>
        <Input name="tags" value={form.tags} onChange={onChange} placeholder="VIP, Regular, Walk-in" />
      </div>
      <div className="col-span-12 md:col-span-3">
        <Label>Preferred Staff</Label>
        <Input name="preferredStaffName" value={form.preferredStaffName} onChange={onChange} />
      </div>
      <div className="col-span-12 md:col-span-3">
        <Label>Preferred Service</Label>
        <Input name="preferredServiceName" value={form.preferredServiceName} onChange={onChange} />
      </div>
      <div className="col-span-6 md:col-span-3">
        <Label>Loyalty Points</Label>
        <Input name="loyaltyPoints" type="number" value={form.loyaltyPoints} onChange={onChange} />
      </div>
      <div className="col-span-6 md:col-span-3">
        <Label>Earned Points</Label>
        <Input name="earnedPoints" type="number" value={form.earnedPoints} onChange={onChange} />
      </div>
      <div className="col-span-6 md:col-span-3">
        <Label>Redeemed Points</Label>
        <Input name="redeemedPoints" type="number" value={form.redeemedPoints} onChange={onChange} />
      </div>
      <div className="col-span-6 md:col-span-3">
        <Label>Membership Level</Label>
        <Input name="membershipLevel" value={form.membershipLevel} onChange={onChange} />
      </div>
      <div className="col-span-12">
        <Label>Notes</Label>
        <Textarea name="notes" value={form.notes} onChange={onChange} className="min-h-24" />
      </div>
    </div>
  );
}

function CustomerProfile({ customer, noteContent, setNoteContent, addNote, quickAction }) {
  const stats = customer.statistics || {};

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          <Avatar customer={customer} />
          <span>
            {customer.fullName}
            <span className="block text-sm font-normal text-muted-foreground">{customer.customerCode}</span>
          </span>
        </DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-12 gap-3">
        <Metric label="Total Visits" value={stats.totalVisits || 0} />
        <Metric label="Total Bookings" value={stats.totalBookings || 0} />
        <Metric label="Lifetime Spending" value={money(stats.lifetimeSpending)} />
        <Metric label="Average Spending" value={money(stats.averageSpending)} />
        <Metric label="Cancelled" value={stats.cancellationCount || 0} />
        <Metric label="No-shows" value={stats.noShowCount || 0} />
      </div>

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

      <Tabs defaultValue="profile">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
        </TabsList>

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
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
          <p className="whitespace-pre-wrap rounded-md border p-3 text-sm text-muted-foreground">{customer.notes || "No general notes."}</p>
        </TabsContent>

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

        <TabsContent value="notes" className="space-y-3">
          <Textarea value={noteContent} onChange={(event) => setNoteContent(event.target.value)} className="min-h-28" placeholder="Private staff note" />
          <Button type="button" onClick={addNote}>Add Note</Button>
          <div className="space-y-2">
            {(customer.noteEntries || []).map((note) => (
              <div key={note.id} className="rounded-md border p-3">
                <p className="whitespace-pre-wrap text-sm">{note.content}</p>
                <p className="mt-2 text-xs text-muted-foreground">{note.staffName || "Staff"} at {formatDateTime(note.createdAt)}</p>
              </div>
            ))}
            {!customer.noteEntries?.length && <p className="text-sm text-muted-foreground">No private notes yet.</p>}
          </div>
        </TabsContent>

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

        <TabsContent value="loyalty">
          <div className="grid grid-cols-12 gap-3">
            <Info label="Loyalty Points" value={customer.loyaltyPoints} />
            <Info label="Earned Points" value={customer.earnedPoints} />
            <Info label="Redeemed Points" value={customer.redeemedPoints} />
            <Info label="Membership Level" value={customer.membershipLevel} />
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}

function Metric({ label, value }) {
  return (
    <Card className="col-span-6 md:col-span-4 xl:col-span-2">
      <CardContent className="p-3">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-lg font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function Info({ label, value, wide = false }) {
  return (
    <div className={wide ? "col-span-12" : "col-span-12 md:col-span-4"}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "-"}</p>
    </div>
  );
}

function EmptyRow({ colSpan, label }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="py-8 text-center text-muted-foreground">
        {label}
      </TableCell>
    </TableRow>
  );
}
