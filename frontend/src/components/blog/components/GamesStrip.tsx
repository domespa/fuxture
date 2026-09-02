import { useEffect, useState } from "react";
import "./GamesStrip.css";
import { Link } from "react-router-dom";
import { ArrowRight, Gamepad2, Play, Users } from "lucide-react";
import { gamesAPI } from "@/services/api";
import type { Game } from "@/types/game.types";

// ====================================================================================================== //
//        Fascia giochi in home: fondo scuro, cosi spezza il grigio chiaro del resto della pagina
//        e riprende la palette della sezione /games. Se non ci sono giochi pubblicati non si vede.
// ====================================================================================================== //
export default function GamesStrip() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    gamesAPI
      .getGames({ sortBy: "order", sortOrder: "asc", limit: 3 })
      .then((data) => setGames(data.games))
      .catch(console.error)
      .finally(() => setIsLoading(false));
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
              Gratis, senza registrazione. Due minuti e torni a leggere.
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
            {games.map((game) => (
              <Link key={game.id} to={`/games/${game.slug}`} className="gs-card">
                <div className="gs-card__icon">
                  <Play size={18} />
                </div>
                <div className="gs-card__body">
                  <h3 className="gs-card__title">{game.title}</h3>
                  {game.description && (
                    <p className="gs-card__desc">{game.description}</p>
                  )}
                  <span className="gs-card__meta">
                    <Users size={11} />
                    {game.plays.toLocaleString("it-IT")} partite
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
