import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { emailListsAPI } from "@/services/api";
import { EmailList } from "@/types/email-list.types";
import toast from "react-hot-toast";
import { ListChecks } from "lucide-react";

interface SelectListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSubscriberIds: string[];
  onSuccess: () => void;
}

export default function SelectListDialog({
  open,
  onOpenChange,
  selectedSubscriberIds,
  onSuccess,
}: SelectListDialogProps) {
  const [lists, setLists] = useState<EmailList[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [adding, setAdding] = useState(false);

  // FETCH LISTE
  const fetchLists = async () => {
    try {
      setLoading(true);
      const data = await emailListsAPI.getEmailLists();
      setLists(data);
    } catch (error) {
      console.error("Error fetching lists:", error);
      toast.error("Errore nel caricamento delle liste");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchLists();
      setSelectedListId("");
    }
  }, [open]);

  // AGGIUNGI A LISTA SELEZIONATA
  const handleAddToList = async () => {
    if (!selectedListId) {
      toast.error("Seleziona una lista");
      return;
    }

    const selectedList = lists.find((l) => l.id === selectedListId);

    try {
      setAdding(true);

      await emailListsAPI.addSubscribersToList(selectedListId, {
        subscriberIds: selectedSubscriberIds,
      });

      toast.success(
        `${selectedSubscriberIds.length} iscritto/i aggiunto/i alla lista "${selectedList?.name}"`
      );

      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error adding to list:", error);
      toast.error(
        error.response?.data?.error ||
          "Errore nell'aggiunta degli iscritti alla lista"
      );
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Aggiungi a Lista Email</DialogTitle>
          <DialogDescription>
            Seleziona la lista a cui aggiungere {selectedSubscriberIds.length}{" "}
            iscritto/i
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500">Caricamento liste...</p>
          </div>
        ) : lists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ListChecks className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-500 mb-2">Nessuna lista disponibile</p>
            <p className="text-sm text-gray-400">
              Crea prima una lista nella sezione Email Lists
            </p>
          </div>
        ) : (
          <>
            {/* LISTA RADIO BUTTONS */}
            <RadioGroup
              value={selectedListId}
              onValueChange={setSelectedListId}
            >
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {lists.map((list) => (
                  <div
                    key={list.id}
                    className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedListId(list.id)}
                  >
                    <RadioGroupItem value={list.id} id={list.id} />
                    <Label htmlFor={list.id} className="flex-1 cursor-pointer">
                      <div className="font-medium">{list.name}</div>
                      {list.description && (
                        <div className="text-sm text-gray-500 mt-1">
                          {list.description}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        {list.subscriberCount || 0} iscritti
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            {/* ACTIONS */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annulla
              </Button>
              <Button
                onClick={handleAddToList}
                disabled={!selectedListId || adding}
              >
                {adding ? "Aggiunta in corso..." : "Aggiungi alla Lista"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
