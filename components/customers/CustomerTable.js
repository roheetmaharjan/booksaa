import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Loading from "@/components/common/Loading";
import { Avatar } from "./Avatar";
import { EmptyRow } from "./EmptyRow";

const statusTone = {
  ACTIVE:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  INACTIVE: "bg-slate-50 text-slate-700 border-slate-200",
  BLOCKED:  "bg-red-50 text-red-700 border-red-200",
};

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export function CustomerTable({
  customers,
  loading,
  query,
  setQuery,
  status,
  setStatus,
  sort,
  setSort,
  pagination,
  page,
  setPage,
  onRowClick,
}) {
  return (
    <Card>
      <CardHeader className="gap-3">
        <CardTitle className="text-lg">Customer List</CardTitle>
        <div className="grid grid-cols-12 gap-2">
          <div className="relative col-span-12 lg:col-span-6">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => { setPage(1); setQuery(e.target.value); }}
              placeholder="Search by name, phone, or email"
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={(v) => { setPage(1); setStatus(v); }}>
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
                  <TableRow
                    key={customer.id}
                    className="cursor-pointer"
                    onClick={() => onRowClick(customer.id)}
                  >
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
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(customer.lastVisit)}</TableCell>
                    <TableCell className="text-right">{money(customer.lifetimeSpending)}</TableCell>
                  </TableRow>
                ))}
                {customers.length === 0 && (
                  <EmptyRow colSpan={7} label="No customers found." />
                )}
              </TableBody>
            </Table>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} customers)
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((v) => Math.max(v - 1, 1))}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((v) => v + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
