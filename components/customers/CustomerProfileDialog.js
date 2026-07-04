import { Dialog, DialogContent } from "@/components/ui/dialog";
import Loading from "@/components/common/Loading";
import { CustomerProfile } from "./CustomerProfile";

export function CustomerProfileDialog({
  open,
  onOpenChange,
  loading,
  customer,
  noteContent,
  setNoteContent,
  addNote,
  quickAction,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] h-full overflow-y-auto sm:max-w-7xl">
        {loading || !customer ? (
          <Loading />
        ) : (
          <CustomerProfile
            customer={customer}
            noteContent={noteContent}
            setNoteContent={setNoteContent}
            addNote={addNote}
            quickAction={quickAction}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
