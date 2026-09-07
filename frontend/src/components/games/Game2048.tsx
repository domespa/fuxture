import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, Sparkles, Trophy } from "lucide-react";
import type { GameComponentProps } from "./registry";
import {
  canMove,
  createBoard,
  hasWon,
  highestTile,
  move,
  spawnTile,
  type Board,
  type Direction,
} from "./game2048.logic";

// ====================================================================================================== //
//        2048: unisci le tessere uguali fino ad arrivare a 2048.
//        Nessuna istruzione da leggere, una partita dura quanto vuoi tu, e il punteggio e' un
//        numero solo - il che lo rende adatto alla classifica assoluta senza adattamenti.
//        La logica sta in game2048.logic.ts: qui c'e' soltanto input e resa grafica.
// ====================================================================================================== //

const STORAGE_KEY = "fuxture:2048:best";

// Palette delle tessere: i valori bassi restano spenti, i grandi si accendono.
// Serve a dare un'idea del progresso senza dover leggere il numero.
const TILE_CLASS: Record<number, string> = {
  0: "bg-slate-800/60",
  2: "bg-slate-700 text-slate-200",
  4: "bg-slate-600 text-slate-100",
  8: "bg-sky-700 text-white",
  16: "bg-sky-600 text-white",
  32: "bg-indigo-600 text-white",
  64: "bg-indigo-500 text-white",
  128: "bg-violet-600 text-white",
  256: "bg-violet-500 text-white",
  512: "bg-fuchsia-600 text-white",
  1024: "bg-amber-500 text-slate-900",
  2048: "bg-amber-400 text-slate-900",
};

const tileClass = (value: number): string =>
  TILE_CLASS[value] ?? "bg-amber-300 text-slate-900";

// I numeri a quattro cifre non ci stanno alla stessa dimensione dei due
const tileTextSize = (value: number): string => {
  if (value >= 1024) return "text-lg sm:text-xl";
  if (value >= 128) return "text-xl sm:text-2xl";
  return "text-2xl sm:text-3xl";
};

const KEY_DIRECTIONS: Record<string, Direction> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
  a: "left",
  d: "right",
  w: "up",
  s: "down",
};

const SWIPE_THRESHOLD = 30;

export default function Game2048({ onGameOver }: GameComponentProps) {
  const [board, setBoard] = useState<Board>(createBoard);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [isOver, setIsOver] = useState(false);
  const [reachedGoal, setReachedGoal] = useState(false);

  // La fine partita va comunicata una volta sola: senza questo, ogni
  // ridisegno rimanderebbe il punteggio alla classifica.
  const reported = useRef(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setBest(parseInt(saved, 10) || 0);
    } catch {
      // Navigazione privata o storage bloccato: si gioca lo stesso.
    }
  }, []);

  const newGame = useCallback(() => {
    setBoard(createBoard());
    setScore(0);
    setIsOver(false);
    setReachedGoal(false);
    reported.current = false;
  }, []);

  const play = useCallback(
    (direction: Direction) => {
      if (isOver) return;

      setBoard((current) => {
        const result = move(current, direction);
        // Premere contro un muro non deve generare tessere: sarebbe spazio
        // gratis, e renderebbe la partita infinita.
        if (!result.moved) return current;

        const next = spawnTile(result.board);

        if (result.gained > 0) {
          setScore((value) => value + result.gained);
        }
        if (!reachedGoal && hasWon(next)) {
          setReachedGoal(true);
        }
        if (!canMove(next)) {
          setIsOver(true);
        }

        return next;
      });
    },
    [isOver, reachedGoal]
  );

  // FINE PARTITA: punteggio e tessera piu' alta alla classifica
  useEffect(() => {
    if (!isOver || reported.current) return;
    reported.current = true;

    setBest((previous) => {
      if (score <= previous) return previous;
      try {
        localStorage.setItem(STORAGE_KEY, String(score));
      } catch {
        // niente da fare
      }
      return score;
    });

    onGameOver?.({
      score,
      detail: `tessera ${highestTile(board)}`,
      won: hasWon(board),
    });
  }, [isOver, score, board, onGameOver]);

  // TASTIERA. preventDefault serve o le frecce fanno scorrere la pagina
  // mentre si gioca, che su desktop rende il gioco inutilizzabile.
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const direction = KEY_DIRECTIONS[event.key];
      if (!direction) return;
      event.preventDefault();
      play(direction);
    };

    window.addEventListener("keydown", handleKey, { passive: false });
    return () => window.removeEventListener("keydown", handleKey);
  }, [play]);

  // SWIPE: il pubblico arriva quasi tutto da telefono
  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    const start = touchStart.current;
    if (!start) return;
    touchStart.current = null;

    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;

    if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;

    play(
      Math.abs(dx) > Math.abs(dy)
        ? dx > 0
          ? "right"
          : "left"
        : dy > 0
          ? "down"
          : "up"
    );
  };

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {/* PUNTEGGI */}
      <div className="grid w-full max-w-md grid-cols-3 gap-2 text-center">
        <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
          <div className="text-xs text-slate-400">Punti</div>
          <div className="text-xl font-bold text-white">
            {score.toLocaleString("it-IT")}
          </div>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
          <div className="flex items-center justify-center gap-1 text-xs text-slate-400">
            <Trophy className="h-3 w-3" /> Record
          </div>
          <div className="text-xl font-bold text-white">
            {best.toLocaleString("it-IT")}
          </div>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
          <div className="text-xs text-slate-400">Migliore</div>
          <div className="text-xl font-bold text-white">
            {highestTile(board)}
          </div>
        </div>
      </div>

      {/* GRIGLIA */}
      <div
        className="relative w-full max-w-md touch-none select-none rounded-xl bg-slate-950 p-2 ring-1 ring-slate-700 sm:p-3"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {board.flatMap((row, r) =>
            row.map((value, c) => (
              <div
                key={`${r}-${c}`}
                className={`flex aspect-square items-center justify-center rounded-lg font-bold tabular-nums transition-colors ${tileClass(
                  value
                )} ${tileTextSize(value)}`}
              >
                {value !== 0 && value}
              </div>
            ))
          )}
        </div>

        {isOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-xl bg-slate-950/90 px-6 text-center">
            <h3 className="text-xl font-bold text-white">Partita finita</h3>
            <p className="text-sm text-slate-300">
              {score.toLocaleString("it-IT")} punti, tessera più alta{" "}
              {highestTile(board)}.
              {score > 0 && score >= best && (
                <span className="mt-1 block font-semibold text-amber-400">
                  È il tuo record personale.
                </span>
              )}
            </p>
            <button
              onClick={newGame}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-indigo-500"
            >
              <RotateCcw className="h-4 w-4" />
              Gioca di nuovo
            </button>
          </div>
        )}
      </div>

      {/* TRAGUARDO RAGGIUNTO: si continua a giocare, non si interrompe */}
      {reachedGoal && !isOver && (
        <p className="flex items-center gap-2 text-sm font-semibold text-amber-400">
          <Sparkles className="h-4 w-4" />
          2048 raggiunto. Puoi continuare: la partita finisce quando la griglia
          si blocca.
        </p>
      )}

      {/* COMANDI */}
      <div className="flex w-full max-w-md items-center justify-between gap-3">
        <p className="text-xs text-slate-400">
          Frecce o WASD da tastiera, scorri con il dito da telefono.
        </p>
        <button
          onClick={newGame}
          className="inline-flex flex-shrink-0 items-center gap-2 rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:border-slate-400 hover:text-white"
        >
          <RotateCcw className="h-3 w-3" />
          Nuova partita
        </button>
      </div>
    </div>
  );
}
