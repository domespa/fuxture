import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addressBookAPI } from "@/services/api";
import type { Contact } from "@/types/mailing.types";
import toast from "react-hot-toast";

// ====================================================================================================== //
//        Rubrica: indirizzi usati negli invii manuali, raccolti da soli per non doverli riscrivere.
//        Non e' una lista di distribuzione, e il riquadro lo dice a chi guarda: queste persone non
//        hanno prestato alcun consenso, e le campagne pescano soltanto dagli iscritti.
// ====================================================================================================== //

export default function AddressBook() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setContacts(await addressBookAPI.getContacts({ limit: 100 }));
    } catch (error) {
      console.error("Errore caricamento rubrica:", error);
      toast.error("Errore nel caricamento della rubrica");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const saveName = async (id: string) => {
    try {
      const updated = await addressBookAPI.updateContact(id, {
        name: draftName.trim(),
      });
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, name: updated.name } : c))
      );
      setEditingId(null);
      toast.success("Contatto aggiornato");
    } catch {
      toast.error("Errore nell'aggiornamento");
    }
  };

  const remove = async (contact: Contact) => {
    if (!confirm(`Rimuovere ${contact.email} dalla rubrica?`)) return;
    try {
      await addressBookAPI.deleteContact(contact.id);
      setContacts((prev) => prev.filter((c) => c.id !== contact.id));
      toast.success("Contatto rimosso");
    } catch {
      toast.error("Errore nella rimozione");
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-lg font-bold text-gray-900">Rubrica</h2>
        <p className="mt-1 text-sm text-gray-500">
          Indirizzi usati negli invii manuali, raccolti automaticamente.{" "}
          <strong>Non è una lista di invio</strong>: le campagne pescano solo
          dagli iscritti, che hanno prestato il consenso.
        </p>
      </div>

      {loading ? (
        <div className="flex h-28 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      ) : contacts.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-gray-500">
          Ancora nessun contatto. Si popola da sola al primo invio manuale.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {contacts.map((contact) => (
            <li
              key={contact.id}
              className="flex items-center gap-3 px-5 py-3 text-sm"
            >
              <div className="min-w-0 flex-1">
                {editingId === contact.id ? (
                  <Input
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveName(contact.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    placeholder="Nome"
                    autoFocus
                    className="h-8"
                  />
                ) : (
                  <>
                    <span className="block truncate font-medium text-gray-900">
                      {contact.name || contact.email}
                    </span>
                    {contact.name && (
                      <span className="block truncate text-xs text-gray-500">
                        {contact.email}
                      </span>
                    )}
                  </>
                )}
              </div>

              <span className="flex-shrink-0 text-xs text-gray-400">
                {contact.timesUsed}{" "}
                {contact.timesUsed === 1 ? "invio" : "invii"}
              </span>

              <div className="flex flex-shrink-0 items-center gap-1">
                {editingId === contact.id ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Salva"
                      onClick={() => saveName(contact.id)}
                    >
                      <Check className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Annulla"
                      onClick={() => setEditingId(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Rinomina"
                      onClick={() => {
                        setEditingId(contact.id);
                        setDraftName(contact.name ?? "");
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Rimuovi"
                      onClick={() => remove(contact)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
