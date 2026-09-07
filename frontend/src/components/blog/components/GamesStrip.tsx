import { useEffect, useState } from "react";
import "./GamesStrip.css";
import { Link } from "react-router-dom";
import { ArrowRight, Gamepad2, Play, Timer, Users } from "lucide-react";
import { gamesAPI, leaderboardAPI } from "@/services/api";
import type { Game, GameScore } from "@/types/game.types";

// ====================================================================================================== //
//        Fascia giochi in home: fondo scuro, cosi spezza il grigio chiaro del resto della pagina
//        e riprende la palette della sezione /games. Se non ci sono giochi pubblicati non si vede.
//
//        Ogni card mostra il podio del periodo corrente. Il gancio non e' una frase generica ma il
//        punteggio da battere: e' un numero concreto, cambia da solo e vale piu' di qualsiasi invito.
// ====================================================================================================== //

const MEDALS = ["🥇", "🥈", "🥉"];

export default function GamesStrip() {
  const [games, setGames] = useState<Game[]>([]);
  const [boards, setBoards] = useState<Record<string, GameScore[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    gamesAPI
      .getGames({ sortBy: "order", sortOrder: "asc", limit: 3 })
      .then(async (data) => {
        if (!alive) return;
        setGames(data.games);

        // Una classifica per gioco, in parallelo. Il catch e' per singola
        // richiesta: una classifica che non risponde non deve far sparire
        // l'intera fascia.
        const results = await Promise.all(
          data.games
            .filter((game) => game.leaderboard !== "NONE")
            .map((game) =>
              leaderboardAPI
                .getScores(game.slug, 3)
                .then((board) => [game.slug, board.scores] as const)
                .catch(() => [game.slug, [] as GameScore[]] as const)
            )
        );

        if (alive) setBoards(Object.fromEntries(results));
      })
      .catch(console.error)
      .finally(() => {
        if (alive) setIsLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  // NIENTE FASCIA VUOTA SE NON C E NIENTE DA MOSTRARE
  if (!isLoading && games.length === 0) return null;

  return (
    <section className="gs-band">
      <div className="gs-inner">
        <div className="gs-head">
          <div>
            <span className="gs-tag">
              <Gamepad2 size={12} />
              Fai una pausa
            </span>
            <h2 className="gs-title">Giochi da browser</h2>
            <p className="gs-sub">
              Gratis, senza registrazione. Due minuti per una partita — poi
              guarda se il tuo nome regge in classifica.
            </p>
          </div>
          <Link to="/games" className="gs-more">
            Tutti i giochi <ArrowRight size={14} />
          </Link>
        </div>

        {isLoading ? (
          <div className="gs-grid">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="gs-ghost" />
            ))}
          </div>
        ) : (
          <div className="gs-grid">
            {games.map((game) => {
              const top = boards[game.slug] ?? [];
              const hasBoard = game.leaderboard !== "NONE";

              return (
                <Link
                  key={game.id}
                  to={`/games/${game.slug}`}
                  className="gs-card"
                >
                  <div className="gs-card__icon">
                    <Play size={18} />
                  </div>

                  <div className="gs-card__body">
                    <h3 className="gs-card__title">{game.title}</h3>
                    {game.description && (
                      <p className="gs-card__desc">{game.description}</p>
                    )}

                    {hasBoard && (
                      <div className="gs-board">
                        {top.length > 0 ? (
                          <>
                            <ol className="gs-board__list">
                              {top.map((entry, index) => (
                                <li key={entry.id} className="gs-board__row">
                                  <span className="gs-board__medal">
                                    {MEDALS[index]}
                                  </span>
                                  <span className="gs-board__name">
                                    {entry.playerName}
                                  </span>
                                  <span className="gs-board__score">
                                    {entry.score.toLocaleString("it-IT")}
                                  </span>
                                </li>
                              ))}
                            </ol>
                            <span className="gs-board__cta">
                              Da battere:{" "}
                              <strong>
                                {top[0].score.toLocaleString("it-IT")}
                              </strong>
                            </span>
                          </>
                        ) : (
                          <span className="gs-board__empty">
                            {game.leaderboard === "DAILY"
                              ? "Nessun punteggio oggi: il primo posto è libero."
                              : "Nessun punteggio ancora. Il record lo fai tu."}
                          </span>
                        )}
                      </div>
                    )}

                    <span className="gs-card__meta">
                      <Users size={11} />
                      {game.plays.toLocaleString("it-IT")} partite
                      {game.leaderboard === "DAILY" && (
                        <>
                          <span className="gs-card__dot">·</span>
                          <Timer size={11} />
                          si azzera a mezzanotte
                        </>
                      )}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
