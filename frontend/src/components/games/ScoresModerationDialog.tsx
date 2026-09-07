import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, Pencil, Search, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { leaderboardAPI } from "@/services/api";
import type { Game, ModerationScore } from "@/types/game.types";
import toast from "react-hot-toast";

// ====================================================================================================== //
//                        MODERAZIONE DELLA CLASSIFICA
//
// Il nome giocatore e' scritto da chiunque, senza account. Il filtro lato
// server ferma il caso normale, ma nessun elenco di parole e' completo: serve
// comunque poter intervenire dopo. Rinominare e' l'azione principale, perche'
// cancellare toglie anche il punteggio a chi l'ha ottenuto.
// ====================================================================================================== //

interface ScoresModerationDialogProps {
  game: Game | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ScoresModerationDialog({
  game,
  open,
  onOpenChange,
}: ScoresModerationDialogProps) {
  const [scores, setScores] = useState<ModerationScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchScores = useCallback(async () => {
    if (!game) return;
    try {
      setLoading(true);
      setScores(
        await leaderboardAPI.getScoresForModeration({
          gameId: game.id,
          search: search.trim() || undefined,
        })
      );
    } catch (error) {
      console.error("Errore caricamento punteggi:", error);
      toast.error("Errore nel caricamento dei punteggi");
    } finally {
      setLoading(false);
    }
  }, [game, search]);

  useEffect(() => {
    if (open) fetchScores();
  }, [open, fetchScores]);

  // Chiudendo si azzera lo stato, altrimenti riaprendo su un altro gioco
  // resterebbero visibili i punteggi del precedente.
  useEffect(() => {
    if (!open) {
      setScores([]);
      setSearch("");
      setEditingId(null);
    }
  }, [open]);

  const startEditing = (entry: ModerationScore) => {
    setEditingId(entry.id);
    setDraftName(entry.playerName);
  };

  const saveName = async (id: string) => {
    const name = draftName.trim();
    if (!name) return;

    try {
      setBusyId(id);
      const updated = await leaderboardAPI.renameScore(id, name);
      setScores((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, playerName: updated.playerName } : entry
        )
      );
      setEditingId(null);
      toast.success("Nome aggiornato");
    } catch (error: unknown) {
      // Il server rifiuta i nomi non ammessi e le collisioni con un punteggio
      // gia' presente nello stesso periodo: il suo messaggio e' piu' utile di
      // uno generico.
      const response = (
        error as { response?: { data?: { error?: string } } }
      )?.response;
      toast.error(response?.data?.error ?? "Errore nella rinomina");
    } finally {
      setBusyId(null);
    }
  };

  const removeScore = async (entry: ModerationScore) => {
    if (
      !confirm(
        `Eliminare il punteggio di "${entry.playerName}" (${entry.score})?`
      )
    )
      return;

    try {
      setBusyId(entry.id);
      await leaderboardAPI.deleteScore(entry.id);
      setScores((prev) => prev.filter((item) => item.id !== entry.id));
      toast.success("Punteggio eliminato");
    } catch (error) {
      console.error("Errore eliminazione punteggio:", error);
      toast.error("Errore nell'eliminazione");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Classifica — {game?.title ?? ""}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchScores()}
              placeholder="Cerca per nome..."
              className="pl-9"
            />
          </div>
          <Button variant="outline" onClick={fetchScores} disabled={loading}>
            Cerca
          </Button>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : scores.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-500">
            Nessun punteggio{search.trim() ? " per questa ricerca" : ""}.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-gray-500">
                <th className="py-2 pr-3">Nome</th>
                <th className="py-2 pr-3">Punti</th>
                <th className="py-2 pr-3">Periodo</th>
                <th className="py-2 text-right">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((entry) => (
                <tr key={entry.id} className="border-b last:border-0">
                  <td className="py-2 pr-3">
                    {editingId === entry.id ? (
                      <Input
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveName(entry.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        maxLength={16}
                        autoFocus
                        className="h-8"
                      />
                    ) : (
                      <span className="font-medium text-gray-900">
                        {entry.playerName}
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-3 text-gray-700">
                    {entry.score.toLocaleString("it-IT")}
                  </td>
                  <td className="py-2 pr-3">
                    <code className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {entry.periodKey}
                    </code>
                  </td>
                  <td className="py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {editingId === entry.id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Salva"
                            onClick={() => saveName(entry.id)}
                            disabled={busyId === entry.id}
                          >
                            {busyId === entry.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4 text-green-600" />
                            )}
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
                            onClick={() => startEditing(entry)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Elimina"
                            onClick={() => removeScore(entry)}
                            disabled={busyId === entry.id}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p className="text-xs text-gray-500">
          Rinominare conserva il punteggio: da preferire alla cancellazione,
          che toglie il risultato anche quando il problema è il solo nickname.
        </p>
      </DialogContent>
    </Dialog>
  );
}
