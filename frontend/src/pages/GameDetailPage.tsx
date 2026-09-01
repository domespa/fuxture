import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Gamepad2, Info, Loader2, Users } from "lucide-react";
import toast from "react-hot-toast";
import { gamesAPI, leaderboardAPI } from "@/services/api";
import type { Game, GameScore } from "@/types/game.types";
import Header from "@/components/blog/components/Header";
import GameEmbed from "@/components/games/GameEmbed";
import GameNewsletterCta from "@/components/games/GameNewsletterCta";
import Leaderboard from "@/components/games/Leaderboard";
import PlayerNameGate from "@/components/games/PlayerNameGate";
import { getGameComponent } from "@/components/games/registry";
import type { GameResult } from "@/components/games/registry";
import { useSeo } from "@/hooks/useSeo";
import { usePlayerName } from "@/hooks/usePlayerName";

export default function GameDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);

  const [scores, setScores] = useState<GameScore[]>([]);
  const [scoresLoading, setScoresLoading] = useState(false);
  const [playerRank, setPlayerRank] = useState<number | null>(null);

  const { playerName, setPlayerName } = usePlayerName();
  const ctaRef = useRef<HTMLDivElement>(null);
  const trackedRef = useRef<string | null>(null);

  const hasLeaderboard = !!game && game.leaderboard !== "NONE";

  useSeo({
    title: game ? `${game.seoTitle || game.title} | Fuxture` : "Giochi",
    description: game?.seoDescription || game?.description,
    image: game?.coverImage,
  });

  useEffect(() => {
    if (!slug) return;

    const loadGame = async () => {
      try {
        setIsLoading(true);
        setNotFound(false);
        setHasFinished(false);
        setPlayerRank(null);
        const data = await gamesAPI.getGameBySlug(slug);
        setGame(data);

        // CONTATORE PARTITE: UNA VOLTA SOLA PER APERTURA
        if (trackedRef.current !== slug) {
          trackedRef.current = slug;
          gamesAPI.trackPlay(slug);
        }

        // CLASSIFICA
        if (data.leaderboard !== "NONE") {
          setScoresLoading(true);
          try {
            const board = await leaderboardAPI.getScores(slug);
            setScores(board.scores);
          } finally {
            setScoresLoading(false);
          }
        } else {
          setScores([]);
        }
      } catch (error) {
        console.error("Error fetching game", error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadGame();
  }, [slug]);

  // FINE PARTITA: PUNTEGGIO IN CLASSIFICA, POI CTA NEWSLETTER
  const handleGameOver = useCallback(
    async (result: GameResult) => {
      setHasFinished(true);

      const shouldSubmit =
        !!slug &&
        !!game &&
        game.leaderboard !== "NONE" &&
        !!playerName &&
        typeof result.score === "number" &&
        result.score > 0;

      if (shouldSubmit) {
        try {
          const board = await leaderboardAPI.submitScore(slug, {
            playerName,
            score: result.score as number,
            detail: result.detail,
          });

          setScores(board.scores);
          setPlayerRank(board.rank);

          if (board.isPersonalBest && board.rank <= 3) {
            toast.success(`Sei ${board.rank}° in classifica!`);
          }
        } catch (error) {
          console.error("Error submitting score", error);
          toast.error("Punteggio non salvato in classifica");
        }
      }

      setTimeout(() => {
        ctaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 800);
    },
    [game, playerName, slug]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#F8FAFC" }}>
        <Header />
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (notFound || !game) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#F8FAFC" }}>
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <Gamepad2 className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Gioco non trovato
          </h1>
          <p className="mb-6 text-gray-600">
            Questo gioco non esiste o non e piu disponibile.
          </p>
          <Link
            to="/games"
            className="inline-flex items-center gap-2 text-blue-600 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Torna ai giochi
          </Link>
        </div>
      </div>
    );
  }

  const GameComponent =
    game.type === "INTERNAL" ? getGameComponent(game.entryPath) : null;

  // IL NICKNAME SI CHIEDE UNA VOLTA SOLA, PRIMA DELLA PRIMA PARTITA
  const needsPlayerName = hasLeaderboard && !playerName;

  const gameArea = needsPlayerName ? (
    <PlayerNameGate gameTitle={game.title} onConfirm={setPlayerName} />
  ) : (
    <div className="rounded-xl bg-slate-50 p-4 sm:p-6">
      {game.type === "EMBED" && game.entryPath ? (
        <GameEmbed title={game.title} entryPath={game.entryPath} />
      ) : GameComponent ? (
        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          }
        >
          <GameComponent onGameOver={handleGameOver} />
        </Suspense>
      ) : (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-800">
          Gioco non disponibile: la chiave "{game.entryPath}" non e registrata
          nel registry dei giochi.
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8FAFC" }}>
      <Header />

      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* BREADCRUMB */}
        <Link
          to="/games"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Tutti i giochi
        </Link>

        {/* TITOLO */}
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            {game.title}
          </h1>
          {game.description && (
            <p className="text-gray-600">{game.description}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {game.plays.toLocaleString("it-IT")} partite giocate
            </span>
            {game.category && (
              <span
                className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                style={{ backgroundColor: game.category.color || "#3B82F6" }}
              >
                {game.category.icon} {game.category.name}
              </span>
            )}
            {hasLeaderboard && playerName && (
              <span className="text-gray-500">
                Giochi come{" "}
                <span className="font-semibold text-gray-700">
                  {playerName}
                </span>{" "}
                <button
                  type="button"
                  onClick={() => setPlayerName("")}
                  className="text-blue-600 hover:underline"
                >
                  (cambia)
                </button>
              </span>
            )}
          </div>
        </div>

        {/* GIOCO + CLASSIFICA */}
        <div
          className={`mb-8 grid gap-6 ${
            hasLeaderboard ? "lg:grid-cols-[minmax(0,1fr)_320px]" : ""
          }`}
        >
          <div className="min-w-0">{gameArea}</div>

          {hasLeaderboard && (
            <Leaderboard
              period={game.leaderboard}
              scores={scores}
              isLoading={scoresLoading}
              highlightName={playerName}
              playerRank={playerRank}
            />
          )}
        </div>

        {/* ISTRUZIONI */}
        {game.instructions && (
          <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Come si gioca
              </h2>
            </div>
            <p className="whitespace-pre-line text-sm text-gray-600">
              {game.instructions}
            </p>
          </div>
        )}

        {/* NEWSLETTER */}
        <div
          ref={ctaRef}
          className={
            hasFinished
              ? "rounded-xl ring-2 ring-blue-500 ring-offset-2 transition-shadow"
              : ""
          }
        >
          <GameNewsletterCta gameSlug={game.slug} gameTitle={game.title} />
        </div>
      </div>
    </div>
  );
}
