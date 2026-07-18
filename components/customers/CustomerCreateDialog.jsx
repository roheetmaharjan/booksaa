import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CustomerForm } from "./CustomerForm";

export function CustomerCreateDialog({
  open,
  onOpenChange,
  form,
  onChange,
  setForm,
  onSubmit,
  onCancel,
  saving,
  duplicateState,
  errors,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add customer</DialogTitle>
        </DialogHeader>

        {duplicateState && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            A customer with the same phone or email may already exist. Review before creating, or ignore to create anyway.
          </div>
        )}

        <CustomerForm form={form} onChange={onChange} setForm={setForm} errors={errors} />

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          {duplicateState && (
            <Button type="button" variant="outline" disabled={saving} onClick={() => onSubmit(true)}>
              Ignore Duplicate
            </Button>
          )}
          <Button type="button" disabled={saving} onClick={() => onSubmit(false)}>
            {saving ? "Saving..." : "Save Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
