import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { emailListsAPI } from "@/services/api";
import toast from "react-hot-toast";
import AddSubscribers from "./AddSubscribers";

interface ManageSubscribersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: string;
  listName: string;
}

interface ListSubscriber {
  id: string;
  email: string;
  name: string | null;
  status: string;
  subscribedAt: string;
}

export default function ManageSubscribersDialog({
  open,
  onOpenChange,
  listId,
  listName,
}: ManageSubscribersDialogProps) {
  const [subscribers, setSubscribers] = useState<ListSubscriber[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [removing, setRemoving] = useState(false);

  // DIALOG AGGIUNGI
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // FETCH SUBSCRIBERS DELLA LISTA
  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const data = await emailListsAPI.getListSubscribers(listId);
      setSubscribers(data);
      setSelectedIds([]); // Reset selezione
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      toast.error("Errore nel caricamento degli iscritti");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchSubscribers();
    }
  }, [open, listId]);

  // TOGGLE SINGOLO CHECKBOX
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

  // RIMUOVI SUBSCRIBERS SELEZIONATI
  const handleRemoveSelected = async () => {
    if (selectedIds.length === 0) {
      toast.error("Seleziona almeno un iscritto da rimuovere");
      return;
    }

    if (
      !confirm(
        `Sei sicuro di voler rimuovere ${selectedIds.length} iscritto/i dalla lista "${listName}"?`
      )
    ) {
      return;
    }

    try {
      setRemoving(true);

      // RIMUOVI UNO ALLA VOLTA
      await Promise.all(
        selectedIds.map((subscriberId) =>
          emailListsAPI.removeSubscriberFromList(listId, subscriberId)
        )
      );

      toast.success(
        `${selectedIds.length} iscritto/i rimosso/i con successo dalla lista`
      );
      fetchSubscribers(); // Refresh
    } catch (error) {
      console.error("Error removing subscribers:", error);
      toast.error("Errore nella rimozione degli iscritti");
    } finally {
      setRemoving(false);
    }
  };

  // FORMAT DATA
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Gestisci Iscritti - {listName}</DialogTitle>
            <DialogDescription>
              Aggiungi o rimuovi iscritti da questa lista
            </DialogDescription>
          </DialogHeader>

          {/* ACTIONS BAR */}
          <div className="flex items-center justify-between py-3 border-b">
            <div className="text-sm text-gray-600">
              {subscribers.length} iscritto/i totali
              {selectedIds.length > 0 && (
                <span className="ml-2 font-medium">
                  ({selectedIds.length} selezionato/i)
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Aggiungi Iscritti
              </Button>
              {selectedIds.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveSelected}
                  disabled={removing}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Rimuovi Selezionati
                </Button>
              )}
            </div>
          </div>

          {/* TABELLA */}
          <div className="flex-1 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-gray-500">Caricamento...</p>
              </div>
            ) : subscribers.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-gray-500">
                  Nessun iscritto in questa lista. Aggiungi il primo!
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
                    <TableHead>Iscritto il</TableHead>
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
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            sub.status === "ACTIVE"
                              ? "bg-green-200 text-green-800"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {sub.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(sub.subscribedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* FOOTER */}
          <div className="flex justify-end pt-3 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Chiudi
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* DIALOG AGGIUNGI SUBSCRIBERS */}
      <AddSubscribers
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        listId={listId}
        listName={listName}
        currentSubscriberIds={subscribers.map((s) => s.id)}
        onSuccess={fetchSubscribers}
      />
    </>
  );
}
