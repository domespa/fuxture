import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gamesAPI } from "@/services/api";
import GameDialog from "@/components/games/GameDialog";
import type { Game } from "@/types/game.types";
import toast from "react-hot-toast";

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  // FETCH GAMES (ADMIN: VEDE ANCHE LE BOZZE)
  const fetchGames = async () => {
    try {
      setLoading(true);
      const data = await gamesAPI.getGames({
        sortBy: "order",
        sortOrder: "asc",
        limit: 100,
      });
      setGames(data.games);
    } catch (error) {
      console.error("Error fetching games:", error);
      toast.error("Errore nel caricamento dei giochi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  // DELETE GIOCO
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Sei sicuro di voler eliminare "${title}"?`)) return;

    try {
      setDeleting(id);
      await gamesAPI.deleteGame(id);
      toast.success("Gioco eliminato con successo");
      fetchGames();
    } catch (error) {
      console.error("Error deleting game:", error);
      toast.error("Errore nell'eliminazione del gioco");
    } finally {
      setDeleting(null);
    }
  };

  // PUBBLICA / METTI IN BOZZA
  const handleToggleStatus = async (game: Game) => {
    try {
      await gamesAPI.updateGame(game.id, {
        status: game.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
      });
      toast.success(
        game.status === "PUBLISHED" ? "Gioco messo in bozza" : "Gioco pubblicato"
      );
      fetchGames();
    } catch (error) {
      console.error("Error toggling game:", error);
      toast.error("Errore nell'aggiornamento del gioco");
    }
  };

  if (loading && games.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-lg">Caricamento giochi...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Giochi</h1>
          <p className="mt-1 text-gray-600">
            Gestisci i giochi browser pubblicati sul blog
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingGame(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuovo Gioco
        </Button>
      </div>

      {/* TABELLA */}
      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Gioco
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Partite
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Stato
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {games.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Nessun gioco trovato. Crea il tuo primo gioco!
                  </td>
                </tr>
              ) : (
                games.map((game) => (
                  <tr key={game.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {game.coverImage && (
                          <img
                            src={game.coverImage}
                            alt={game.title}
                            className="h-10 w-16 rounded object-cover"
                          />
                        )}
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {game.title}
                          </span>
                          {game.isFeatured && (
                            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                              In evidenza
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                        {game.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{game.type}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {game.plays.toLocaleString("it-IT")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          game.status === "PUBLISHED"
                            ? "bg-green-200 text-green-800"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {game.status === "PUBLISHED" ? "Pubblicato" : "Bozza"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/games/${game.slug}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button variant="ghost" size="icon" title="Apri">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(game)}
                          title={
                            game.status === "PUBLISHED"
                              ? "Metti in bozza"
                              : "Pubblica"
                          }
                        >
                          {game.status === "PUBLISHED" ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingGame(game);
                            setDialogOpen(true);
                          }}
                          title="Modifica"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(game.id, game.title)}
                          disabled={deleting === game.id}
                          title="Elimina"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
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

      <GameDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editGame={editingGame}
        onSuccess={fetchGames}
      />
    </div>
  );
}
