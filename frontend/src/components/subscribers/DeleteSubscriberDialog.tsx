import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface DeleteSubscriberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriberEmail: string;
  onConfirm: () => void;
  isDeleting: boolean;
}

export default function DeleteSubscriberDialog({
  open,
  onOpenChange,
  subscriberEmail,
  onConfirm,
  isDeleting,
}: DeleteSubscriberDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-red-100 p-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle>Sei sicuro?</DialogTitle>
          </div>
          <DialogDescription className="pt-3">
            Stai per eliminare l'iscritto:{" "}
            <span className="font-semibold text-gray-900">
              {subscriberEmail}
            </span>
            <br />
            <br />
            Questa azione è irreversibile e rimuoverà l'iscritto da tutte le
            liste email.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Annulla
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminazione..." : "Elimina Iscritto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
