import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";
import { subscribersAPI, emailListsAPI } from "@/services/api";
import toast from "react-hot-toast";

interface AddSubscribersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: string;
  listName: string;
  currentSubscriberIds: string[]; // IDs già nella lista
  onSuccess: () => void;
}

interface AvailableSubscriber {
  id: string;
  email: string;
  name: string | null;
  status: string;
}

export default function AddSubscribersDialog({
  open,
  onOpenChange,
  listId,
  listName,
  currentSubscriberIds,
  onSuccess,
}: AddSubscribersDialogProps) {
  const [subscribers, setSubscribers] = useState<AvailableSubscriber[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // FETCH TUTTI I SUBSCRIBERS (solo ACTIVE, esclusi quelli già nella lista)
  const fetchAvailableSubscribers = async () => {
    try {
      setLoading(true);
      const data = await subscribersAPI.getSubscribers({
        status: "ACTIVE",
        limit: 100,
        search: searchTerm || undefined,
      });

      // FILTRA quelli già nella lista
      const available = data.subscribers.filter(
        (sub) => !currentSubscriberIds.includes(sub.id)
      );

      setSubscribers(available);
      setSelectedIds([]);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      toast.error("Errore nel caricamento degli iscritti disponibili");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchAvailableSubscribers();
    }
  }, [open, searchTerm]);

  // TOGGLE SINGOLO
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // TOGGLE SELECT ALL
  const toggleSelectAll = () => {
    if (selectedIds.length === subscribers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(subscribers.map((s) => s.id));
    }
  };

  // AGGIUNGI SELEZIONATI
  const handleAddSelected = async () => {
    if (selectedIds.length === 0) {
      toast.error("Seleziona almeno un iscritto da aggiungere");
      return;
    }

    try {
      setAdding(true);

      await emailListsAPI.addSubscribersToList(listId, {
        subscriberIds: selectedIds,
      });

      toast.success(
        `${selectedIds.length} iscritto/i aggiunto/i con successo alla lista "${listName}"`
      );

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error adding subscribers:", error);
      toast.error("Errore nell'aggiunta degli iscritti");
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Aggiungi Iscritti - {listName}</DialogTitle>
          <DialogDescription>
            Seleziona gli iscritti da aggiungere a questa lista
          </DialogDescription>
        </DialogHeader>

        {/* SEARCH BAR */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Cerca per email o nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* INFO */}
        <div className="text-sm text-gray-600">
          {subscribers.length} iscritto/i disponibile/i
          {selectedIds.length > 0 && (
            <span className="ml-2 font-medium">
              ({selectedIds.length} selezionato/i)
            </span>
          )}
        </div>

        {/* TABELLA */}
        <div className="flex-1 overflow-auto border rounded-lg">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-500">Caricamento...</p>
            </div>
          ) : subscribers.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-500">
                Nessun iscritto disponibile da aggiungere
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === subscribers.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(sub.id)}
                        onCheckedChange={() => toggleSelect(sub.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{sub.email}</TableCell>
                    <TableCell>{sub.name || "—"}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-200 text-green-800">
                        {sub.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 pt-3 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annulla
          </Button>
          <Button
            onClick={handleAddSelected}
            disabled={selectedIds.length === 0 || adding}
          >
            {adding
              ? "Aggiunta in corso..."
              : `Aggiungi ${selectedIds.length} Iscritto/i`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
