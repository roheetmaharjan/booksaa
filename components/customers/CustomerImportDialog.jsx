import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CustomerImportDialog({
  open,
  onOpenChange,
  onFileChange,
  onImport,
  onCancel,
  duplicates,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import customers</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Label htmlFor="customer-csv">CSV file</Label>
          <Input
            id="customer-csv"
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => onFileChange(e.target.files?.[0] || null)}
          />
          <p className="text-sm text-muted-foreground">
            Headers supported: Name, Phone, Email, Address, Notes.
          </p>

          {duplicates.length > 0 && (
            <div className="max-h-48 overflow-y-auto rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">
              <p className="font-medium text-amber-900">{duplicates.length} possible duplicates found.</p>
              {duplicates.slice(0, 5).map((item) => (
                <p key={item.row} className="text-amber-800">
                  Row {item.row}: {item.customer.fullName}
                </p>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          {duplicates.length > 0 && (
            <Button type="button" variant="outline" onClick={() => onImport(true)}>
              Import Duplicates
            </Button>
          )}
          <Button type="button" onClick={() => onImport(false)}>
            Import CSV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
