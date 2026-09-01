import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Gamepad2, Play, Users } from "lucide-react";
import { gamesAPI } from "@/services/api";
import type { Game } from "@/types/game.types";
import { useSeo } from "@/hooks/useSeo";
import { GAMES_BG } from "@/components/games/theme";

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useSeo({
    title: "Giochi online gratis | Fuxture",
    description:
      "Giochi da browser gratuiti, senza registrazione e senza download: sfide veloci da fare al volo, anche da telefono.",
  });

  useEffect(() => {
    const loadGames = async () => {
      try {
        setIsLoading(true);
        const data = await gamesAPI.getGames({
          sortBy: "order",
          sortOrder: "asc",
          limit: 48,
        });
        setGames(data.games);
      } catch (error) {
        console.error("Error fetching games", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadGames();
  }, []);

  return (
    <div className="min-h-[calc(100vh-52px)]" style={{ backgroundColor: GAMES_BG }}>
      {/* HERO */}
      <div className="border-b border-slate-800 bg-gradient-to-b from-slate-800 to-transparent">
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <Gamepad2 className="h-7 w-7 text-blue-400" />
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              Giochi
            </h1>
          </div>
          <p className="mx-auto max-w-2xl text-slate-300">
            Giochi da browser gratuiti, senza registrazione e senza download.
            Aprili, gioca, sfida i tuoi amici.
          </p>
        </div>
      </div>

      {/* GRIGLIA */}
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-64 animate-pulse rounded-xl bg-slate-800"
              />
            ))}
          </div>
        ) : games.length === 0 ? (
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-12 text-center">
            <Gamepad2 className="mx-auto mb-4 h-10 w-10 text-slate-600" />
            <p className="text-slate-300">
              Nessun gioco pubblicato al momento. Torna presto!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <Link
                key={game.id}
                to={`/games/${game.slug}`}
                className="group overflow-hidden rounded-xl border border-slate-700 bg-slate-800 transition-all hover:border-slate-600 hover:shadow-lg hover:shadow-blue-500/10"
              >
                {/* COVER */}
                <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700">
                  {game.coverImage ? (
                    <img
                      src={game.coverImage}
                      alt={game.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Gamepad2 className="h-12 w-12 text-white/80" />
                    </div>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/0 transition-colors group-hover:bg-slate-900/50">
                    <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 opacity-0 transition-opacity group-hover:opacity-100">
                      <Play className="h-4 w-4" />
                      Gioca
                    </span>
                  </div>
                </div>

                {/* TESTO */}
                <div className="p-5">
                  <div className="mb-2 flex items-center gap-2">
                    {game.category && (
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                        style={{
                          backgroundColor: game.category.color || "#3B82F6",
                        }}
                      >
                        {game.category.icon} {game.category.name}
                      </span>
                    )}
                  </div>

                  <h2 className="mb-1 text-lg font-bold text-white group-hover:text-blue-400">
                    {game.title}
                  </h2>

                  {game.description && (
                    <p className="line-clamp-2 text-sm text-slate-400">
                      {game.description}
                    </p>
                  )}

                  <div className="mt-3 flex items-center gap-1 text-xs text-slate-500">
                    <Users className="h-3 w-3" />
                    {game.plays.toLocaleString("it-IT")} partite
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
