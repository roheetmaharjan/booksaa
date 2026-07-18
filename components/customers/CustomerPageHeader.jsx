import { Download, FileSpreadsheet, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CustomerPageHeader({ onImport, onExport, onAdd }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h4 className="page-title">Customers</h4>
        <p className="text-sm text-muted-foreground">
          Manage customer profiles, history, notes, tags, loyalty, and communication records.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={onImport}>
          <Upload className="size-4" />
          Import
        </Button>
        <Button type="button" variant="outline" onClick={() => onExport("csv")}>
          <Download className="size-4" />
          CSV
        </Button>
        <Button type="button" variant="outline" onClick={() => onExport("excel")}>
          <FileSpreadsheet className="size-4" />
          Excel
        </Button>
        <Button type="button" onClick={onAdd}>
          <Plus className="size-4" />
          Add Customer
        </Button>
      </div>
    </div>
  );
}
