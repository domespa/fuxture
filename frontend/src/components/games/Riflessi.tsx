import { useCallback, useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Timer, Target as TargetIcon, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GameComponentProps } from "./registry";

// ====================================================================================================== //
//                                       COSTANTI DI GIOCO
// ====================================================================================================== //
const DURATION_SECONDS = 30;
const BOMB_CHANCE = 0.18;
const BOMB_PENALTY = 5;
const BASE_LIFETIME = 1500;
const MIN_LIFETIME = 600;
const STORAGE_KEY = "fuxture-riflessi-record";

type GameStatus = "idle" | "playing" | "over";

interface Target {
  id: number;
  x: number;
  y: number;
  size: number;
  isBomb: boolean;
  lifetime: number;
  spawnedAt: number;
}

export default function Riflessi({ onGameOver }: GameComponentProps) {
  const [status, setStatus] = useState<GameStatus>("idle");
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION_SECONDS);
  const [target, setTarget] = useState<Target | null>(null);
  const [bestScore, setBestScore] = useState(0);
  const [avgReaction, setAvgReaction] = useState<number | null>(null);

  const idRef = useRef(0);
  const hitsRef = useRef(0);
  const scoreRef = useRef(0);
  const bestRef = useRef(0);
  const reactionsRef = useRef<number[]>([]);

  // PUNTEGGIO SEMPRE AGGIORNATO ANCHE DENTRO I TIMER
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // RECORD PERSONALE
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? parseInt(saved, 10) || 0 : 0;
      bestRef.current = parsed;
      setBestScore(parsed);
    } catch {
      // STORAGE NON DISPONIBILE
    }
  }, []);

  // GENERA UN NUOVO BERSAGLIO: PIU BERSAGLI PRESI, PIU DIVENTA PICCOLO E VELOCE
  const spawnTarget = useCallback(() => {
    const difficulty = hitsRef.current;
    const size = Math.max(9, 18 - difficulty * 0.3);
    const margin = size / 2 + 2;

    setTarget({
      id: ++idRef.current,
      x: margin + Math.random() * (100 - margin * 2),
      y: margin + Math.random() * (100 - margin * 2),
      size,
      isBomb: Math.random() < BOMB_CHANCE,
      lifetime: Math.max(MIN_LIFETIME, BASE_LIFETIME - difficulty * 35),
      spawnedAt: Date.now(),
    });
  }, []);

  const startGame = useCallback(() => {
    idRef.current = 0;
    hitsRef.current = 0;
    reactionsRef.current = [];
    setScore(0);
    setHits(0);
    setMisses(0);
    setAvgReaction(null);
    setTimeLeft(DURATION_SECONDS);
    setStatus("playing");
    spawnTarget();
  }, [spawnTarget]);

  // TIMER PARTITA
  useEffect(() => {
    if (status !== "playing") return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  // FINE PARTITA
  useEffect(() => {
    if (status !== "playing" || timeLeft > 0) return;

    setStatus("over");
    setTarget(null);

    const reactions = reactionsRef.current;
    setAvgReaction(
      reactions.length
        ? Math.round(reactions.reduce((a, b) => a + b, 0) / reactions.length)
        : null
    );

    const finalScore = scoreRef.current;

    if (finalScore > bestRef.current) {
      bestRef.current = finalScore;
      setBestScore(finalScore);
      try {
        localStorage.setItem(STORAGE_KEY, String(finalScore));
      } catch {
        // STORAGE NON DISPONIBILE
      }
    }

    onGameOver?.({ score: finalScore });
  }, [status, timeLeft, onGameOver]);

  // SCADENZA DEL BERSAGLIO
  useEffect(() => {
    if (status !== "playing" || !target) return;

    const timeout = setTimeout(() => {
      // LE BOMBE IGNORATE NON SONO UN ERRORE
      if (!target.isBomb) setMisses((prev) => prev + 1);
      spawnTarget();
    }, target.lifetime);

    return () => clearTimeout(timeout);
  }, [status, target, spawnTarget]);

  const handleTargetClick = () => {
    if (status !== "playing" || !target) return;

    if (target.isBomb) {
      setScore((prev) => Math.max(0, prev - BOMB_PENALTY));
      setMisses((prev) => prev + 1);
      spawnTarget();
      return;
    }

    const reaction = Date.now() - target.spawnedAt;
    reactionsRef.current.push(reaction);

    // PIU SEI VELOCE, PIU PUNTI: DA 1 A 10
    const speedBonus = Math.max(
      1,
      Math.round(10 * (1 - reaction / target.lifetime))
    );

    hitsRef.current += 1;
    setHits(hitsRef.current);
    setScore((prev) => prev + speedBonus);
    spawnTarget();
  };

  const accuracy =
    hits + misses > 0 ? Math.round((hits / (hits + misses)) * 100) : 0;

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {/* STATISTICHE */}
      <div className="grid w-full max-w-2xl grid-cols-4 gap-2 text-center">
        <div className="rounded-lg bg-white p-3 shadow-sm">
          <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
            <Zap className="h-3 w-3" /> Punti
          </div>
          <div className="text-xl font-bold text-gray-900">{score}</div>
        </div>
        <div className="rounded-lg bg-white p-3 shadow-sm">
          <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
            <Timer className="h-3 w-3" /> Tempo
          </div>
          <div className="text-xl font-bold text-gray-900">{timeLeft}s</div>
        </div>
        <div className="rounded-lg bg-white p-3 shadow-sm">
          <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
            <TargetIcon className="h-3 w-3" /> Precisione
          </div>
          <div className="text-xl font-bold text-gray-900">{accuracy}%</div>
        </div>
        <div className="rounded-lg bg-white p-3 shadow-sm">
          <div className="text-xs text-gray-500">Record</div>
          <div className="text-xl font-bold text-gray-900">{bestScore}</div>
        </div>
      </div>

      {/* AREA DI GIOCO */}
      <div className="relative aspect-[4/3] w-full max-w-2xl select-none overflow-hidden rounded-xl bg-slate-900 shadow-inner">
        {status === "playing" && target && (
          <button
            key={target.id}
            type="button"
            onClick={handleTargetClick}
            style={{
              left: `${target.x}%`,
              top: `${target.y}%`,
              width: `${target.size}%`,
              transform: "translate(-50%, -50%)",
            }}
            className={`absolute aspect-square rounded-full transition-transform active:scale-90 ${
              target.isBomb
                ? "bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.7)]"
                : "bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.7)]"
            }`}
            aria-label={target.isBomb ? "Bomba" : "Bersaglio"}
          >
            <span className="flex h-full w-full items-center justify-center text-lg">
              {target.isBomb ? "💣" : ""}
            </span>
          </button>
        )}

        {status !== "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
            {status === "idle" ? (
              <>
                <h3 className="text-xl font-bold text-white">
                  Quanto sei veloce?
                </h3>
                <p className="max-w-sm text-sm text-slate-300">
                  Colpisci i cerchi verdi il piu velocemente possibile per 30
                  secondi. Evita le bombe rosse: ti tolgono {BOMB_PENALTY}{" "}
                  punti.
                </p>
                <Button onClick={startGame} size="lg">
                  <Play className="mr-2 h-4 w-4" />
                  Inizia
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-white">
                  {score} punti
                </h3>
                <p className="text-sm text-slate-300">
                  {hits} bersagli colpiti · {accuracy}% di precisione
                  {avgReaction !== null && ` · ${avgReaction}ms di media`}
                </p>
                {score >= bestScore && score > 0 && (
                  <p className="text-sm font-semibold text-emerald-400">
                    Nuovo record personale!
                  </p>
                )}
                <Button onClick={startGame} size="lg">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Gioca ancora
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
