import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Gamepad2, Play, Users } from "lucide-react";
import { gamesAPI } from "@/services/api";
import type { Game } from "@/types/game.types";
import Header from "@/components/blog/components/Header";
import { useSeo } from "@/hooks/useSeo";

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
    <div className="min-h-screen" style={{ backgroundColor: "#F8FAFC" }}>
      <Header />

      {/* HERO */}
      <div className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <Gamepad2 className="h-7 w-7 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
              Giochi
            </h1>
          </div>
          <p className="mx-auto max-w-2xl text-gray-600">
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
                className="h-64 animate-pulse rounded-xl bg-white shadow-sm"
              />
            ))}
          </div>
        ) : games.length === 0 ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <Gamepad2 className="mx-auto mb-4 h-10 w-10 text-gray-300" />
            <p className="text-gray-600">
              Nessun gioco pubblicato al momento. Torna presto!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <Link
                key={game.id}
                to={`/games/${game.slug}`}
                className="group overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-lg"
              >
                {/* COVER */}
                <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600">
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

                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                    <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-900 opacity-0 transition-opacity group-hover:opacity-100">
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

                  <h2 className="mb-1 text-lg font-bold text-gray-900 group-hover:text-blue-600">
                    {game.title}
                  </h2>

                  {game.description && (
                    <p className="line-clamp-2 text-sm text-gray-600">
                      {game.description}
                    </p>
                  )}

                  <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
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
