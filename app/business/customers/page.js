"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useMutation } from "@/hooks/useMutation";
import { validateCustomer } from "@/lib/validations/customer";

import { CustomerPageHeader } from "@/components/customers/CustomerPageHeader";
import { CustomerSummaryCards } from "@/components/customers/CustomerSummaryCards";
import { CustomerTable } from "@/components/customers/CustomerTable";
import { CustomerCreateDialog } from "@/components/customers/CustomerCreateDialog";
import { CustomerImportDialog } from "@/components/customers/CustomerImportDialog";
import { CustomerProfileDialog } from "@/components/customers/CustomerProfileDialog";

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

function encodeQuery(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, value);
  });
  return query.toString();
}

export default function CustomersPage() {
  // List state
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);

  // Dialog visibility
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Create form
  const [customerForm, setCustomerForm] = useState(emptyCustomer);
  const [errors, setErrors] = useState({});
  const [duplicateState, setDuplicateState] = useState(null);

  // Profile
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [noteContent, setNoteContent] = useState("");

  // Import
  const [importFile, setImportFile] = useState(null);
  const [importDuplicates, setImportDuplicates] = useState([]);

  const { mutate: createCustomer, loading: savingCustomer } = useMutation("/api/customers", { method: "POST" });

  // ── Data fetching ──────────────────────────────────────────────
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

  const handleSubmit = async (ignoreDuplicate) => {
    const validationErrors = validateCustomer(customerForm);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    await submitCustomer(ignoreDuplicate);
  };

  // ── Create ─────────────────────────────────────────────────────
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCustomerForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetCreate = () => {
    setCustomerForm(emptyCustomer);
    setDuplicateState(null);
  };

  const submitCustomer = async (ignoreDuplicate = false) => {
    try {
      await createCustomer({ ...customerForm, ignoreDuplicate });
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

  // ── Notes ──────────────────────────────────────────────────────
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

  // ── Quick actions ──────────────────────────────────────────────
  const quickAction = (type) => {
    if (!selectedCustomer) return;
    if (type === "call" && selectedCustomer.phone) window.location.href = `tel:${selectedCustomer.phone}`;
    else if (type === "sms" && selectedCustomer.phone) window.location.href = `sms:${selectedCustomer.phone}`;
    else if (type === "email" && selectedCustomer.email) window.location.href = `mailto:${selectedCustomer.email}`;
    else if (type === "book") window.location.href = `/business/calendar?customerId=${selectedCustomer.id}`;
    else toast.info("This action is ready for the next integration.");
  };

  // ── Import / Export ───────────────────────────────────────────
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

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <CustomerPageHeader onImport={() => setImportOpen(true)} onExport={exportCustomers} onAdd={() => setCreateOpen(true)} />

        <CustomerSummaryCards stats={stats} />

        <CustomerTable customers={customers} loading={loading} query={query} setQuery={setQuery} status={status} setStatus={setStatus} sort={sort} setSort={setSort} pagination={pagination} page={page} setPage={setPage} onRowClick={loadProfile} />
      </div>

      <CustomerCreateDialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) resetCreate();
        }}
        form={customerForm}
        onChange={handleFormChange}
        setForm={setCustomerForm}
        onSubmit={handleSubmit}
        onCancel={() => setCreateOpen(false)}
        saving={savingCustomer}
        duplicateState={duplicateState}
        errors={errors}
      />

      <CustomerImportDialog open={importOpen} onOpenChange={setImportOpen} onFileChange={setImportFile} onImport={importCustomers} onCancel={() => setImportOpen(false)} duplicates={importDuplicates} />

      <CustomerProfileDialog open={profileOpen} onOpenChange={setProfileOpen} loading={profileLoading} customer={selectedCustomer} noteContent={noteContent} setNoteContent={setNoteContent} addNote={addNote} quickAction={quickAction} />
    </div>
  );
}
