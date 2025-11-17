import { useEffect, useState } from "react";
import { emailListsAPI } from "@/services/api";
import { EmailList } from "@/types/email-list.types";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import toast from "react-hot-toast";
import CreateEditListDialog from "@/pages/admin/dashboard/CreateEditList";
import ManageSubscribers from "@/pages/admin/dashboard/ManageSubscribers";

export default function EmailListsPage() {
  const [lists, setLists] = useState<EmailList[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingList, setEditingList] = useState<EmailList | null>(null);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [managingList, setManagingList] = useState<EmailList | null>(null);

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
    fetchLists();
  }, []);

  // DELETE LISTA
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Sei sicuro di voler eliminare "${name}"?`)) return;

    try {
      setDeleting(id);
      await emailListsAPI.deleteEmailList(id);
      toast.success("Lista eliminata con successo");
      fetchLists();
    } catch (error) {
      console.error("Error deleting list:", error);
      toast.error("Errore nell'eliminazione della lista");
    } finally {
      setDeleting(null);
    }
  };

  // APRI CREATE DIALOG
  const handleCreate = () => {
    setEditingList(null);
    setDialogOpen(true);
  };

  // APRI EDIT DIALOG
  const handleEdit = (list: EmailList) => {
    setEditingList(list);
    setDialogOpen(true);
  };

  // MANAGE SUBSCRIBERS
  const handleManageSubscribers = (list: EmailList) => {
    setManagingList(list);
    setManageDialogOpen(true);
  };

  // FORMAT DATA
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (loading && lists.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-lg">Caricamento liste...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Liste Email</h1>
          <p className="text-gray-600 mt-1">
            Gestisci le tue liste di iscritti
          </p>
        </div>

        {/* BOTTONE CREA */}
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuova Lista
        </Button>
      </div>

      {/* TABELLA LISTE */}
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrizione
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visibilità
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Iscritti
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Creata il
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {lists.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Nessuna lista trovata. Crea la tua prima lista!
                  </td>
                </tr>
              ) : (
                lists.map((list) => (
                  <tr key={list.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {list.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {list.description || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          list.isPublic
                            ? "bg-green-200 text-green-800"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {list.isPublic ? "Pubblica" : "Privata"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {list.subscriberCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(list.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* MANAGE SUBSCRIBERS BUTTON */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleManageSubscribers(list)}
                          title="Gestisci iscritti"
                        >
                          <Users className="h-4 w-4" />
                        </Button>

                        {/* EDIT BUTTON */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(list)}
                          title="Modifica lista"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        {/* DELETE BUTTON */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(list.id, list.name)}
                          disabled={deleting === list.id}
                          className="text-red-600 hover:text-red-700"
                          title="Elimina lista"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DIALOG CREATE/EDIT */}
      <CreateEditListDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editList={editingList}
        onSuccess={fetchLists}
      />
      {managingList && (
        <ManageSubscribers
          open={manageDialogOpen}
          onOpenChange={setManageDialogOpen}
          listId={managingList.id}
          listName={managingList.name}
        />
      )}
    </div>
  );
}
