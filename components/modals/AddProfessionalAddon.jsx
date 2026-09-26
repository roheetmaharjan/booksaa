"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function AddProfessionalAddon({
  open = true,
  setAddProfessionalAddonOpen,
  type = "professional",
}) {
  const label = type === "location" ? "location" : "professional";

  return (
    <Dialog open={open} onOpenChange={setAddProfessionalAddonOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {label} add-on</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Add-on checkout is not connected yet. Increase the subscription limit from your billing provider, then return here to add more {label}s.
        </p>
        <DialogFooter>
          <Button type="button" onClick={() => setAddProfessionalAddonOpen?.(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
