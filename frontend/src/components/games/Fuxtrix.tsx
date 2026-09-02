import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronsDown,
  Pause,
  Play,
  RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GameComponentProps } from "./registry";

import {
  COLS,
  ROWS,
  SHAPES,
  dropDistance,
  getSpeed,
  initialState,
  reducer,
} from "./fuxtrix.logic";

// PALETTE DELLA SEZIONE GIOCHI, NON QUELLA DEI CLASSICI ANNI 80
const COLORS: Record<number, string> = {
  1: "bg-sky-400",
  2: "bg-amber-400",
  3: "bg-violet-400",
  4: "bg-emerald-400",
  5: "bg-rose-400",
  6: "bg-blue-500",
  7: "bg-orange-400",
};

const STORAGE_KEY = "fuxture-fuxtrix-record";

export default function Fuxtrix({ onGameOver }: GameComponentProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [bestScore, setBestScore] = useState(0);
  const bestRef = useRef(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const { board, piece, status, score, lines, level, nextId } = state;

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

  // GRAVITA: piu sale il livello, piu scende veloce
  useEffect(() => {
    if (status !== "playing") return;

    const interval = setInterval(() => dispatch({ type: "TICK" }), getSpeed(level));

    return () => clearInterval(interval);
  }, [status, level]);

  // FINE PARTITA
  useEffect(() => {
    if (status !== "over") return;

    if (score > bestRef.current) {
      bestRef.current = score;
      setBestScore(score);
      try {
        localStorage.setItem(STORAGE_KEY, String(score));
      } catch {
        // STORAGE NON DISPONIBILE
      }
    }

    onGameOver?.({
      score,
      detail: `${lines} righe · livello ${level}`,
    });
  }, [status, score, lines, level, onGameOver]);

  // TASTIERA
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      const keys = [
        "ArrowLeft",
        "ArrowRight",
        "ArrowDown",
        "ArrowUp",
        " ",
        "p",
        "P",
      ];
      if (!keys.includes(event.key)) return;

      // NIENTE SCROLL DELLA PAGINA MENTRE SI GIOCA
      event.preventDefault();

      switch (event.key) {
        case "ArrowLeft":
          dispatch({ type: "MOVE", dx: -1 });
          break;
        case "ArrowRight":
          dispatch({ type: "MOVE", dx: 1 });
          break;
        case "ArrowDown":
          dispatch({ type: "SOFT_DROP" });
          break;
        case "ArrowUp":
          dispatch({ type: "ROTATE" });
          break;
        case " ":
          dispatch({ type: "HARD_DROP" });
          break;
        default:
          dispatch({ type: "TOGGLE_PAUSE" });
      }
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // SWIPE SUL CAMPO: trascina per muovere, giu per far cadere, tap per ruotare
  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (!touchStart.current) return;

    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;
    touchStart.current = null;

    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) {
      dispatch({ type: "ROTATE" });
      return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      dispatch({ type: "MOVE", dx: dx > 0 ? 1 : -1 });
    } else if (dy > 0) {
      dispatch({ type: "HARD_DROP" });
    }
  };

  // GRIGLIA DA DISEGNARE: campo + pezzo in caduta + ombra di dove atterrera
  const renderBoard = useCallback((): number[][] => {
    const view = board.map((row) => [...row]);
    if (!piece) return view;

    const distance = dropDistance(board, piece);

    // OMBRA (valore negativo = cella fantasma)
    piece.matrix.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        if (!value) return;
        const y = piece.y + distance + rowIndex;
        const x = piece.x + colIndex;
        if (y >= 0 && y < ROWS && !view[y][x]) view[y][x] = -value;
      });
    });

    // PEZZO VERO
    piece.matrix.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        if (!value) return;
        const y = piece.y + rowIndex;
        const x = piece.x + colIndex;
        if (y >= 0 && y < ROWS) view[y][x] = value;
      });
    });

    return view;
  }, [board, piece]);

  const view = renderBoard();
  const nextMatrix = SHAPES[nextId];

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex w-full max-w-2xl flex-col gap-4 sm:flex-row sm:items-start sm:justify-center">
        {/* CAMPO */}
        <div
          className="relative mx-auto w-full max-w-[320px] touch-none select-none rounded-xl bg-slate-950 p-1.5 ring-1 ring-slate-700"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="grid gap-px"
            style={{
              gridTemplateColumns: `repeat(${COLS}, 1fr)`,
              aspectRatio: `${COLS} / ${ROWS}`,
            }}
          >
            {view.flatMap((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${y}-${x}`}
                  className={`rounded-[2px] ${
                    cell > 0
                      ? COLORS[cell]
                      : cell < 0
                        ? `${COLORS[-cell]} opacity-20`
                        : "bg-slate-800/40"
                  }`}
                />
              ))
            )}
          </div>

          {/* OVERLAY DI STATO */}
          {status !== "playing" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-xl bg-slate-950/85 px-6 text-center">
              {status === "idle" && (
                <>
                  <h3 className="text-xl font-bold text-white">Fuxtrix</h3>
                  <p className="max-w-[240px] text-sm text-slate-300">
                    Incastra i pezzi e completa le righe. Ogni 10 righe si sale
                    di livello e la discesa accelera.
                  </p>
                  <Button onClick={() => dispatch({ type: "START" })} size="lg">
                    <Play className="mr-2 h-4 w-4" />
                    Inizia
                  </Button>
                </>
              )}

              {status === "paused" && (
                <>
                  <h3 className="text-xl font-bold text-white">In pausa</h3>
                  <Button
                    onClick={() => dispatch({ type: "TOGGLE_PAUSE" })}
                    size="lg"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Riprendi
                  </Button>
                </>
              )}

              {status === "over" && (
                <>
                  <h3 className="text-2xl font-bold text-white">
                    {score} punti
                  </h3>
                  <p className="text-sm text-slate-300">
                    {lines} righe · livello {level}
                  </p>
                  {score >= bestScore && score > 0 && (
                    <p className="text-sm font-semibold text-emerald-400">
                      Nuovo record personale!
                    </p>
                  )}
                  <Button onClick={() => dispatch({ type: "START" })} size="lg">
                    <RotateCw className="mr-2 h-4 w-4" />
                    Gioca ancora
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* PANNELLO LATERALE */}
        <div className="flex shrink-0 flex-row gap-3 sm:w-36 sm:flex-col">
          <div className="flex-1 rounded-lg border border-slate-700 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Punti</div>
            <div className="text-xl font-bold text-white">{score}</div>
          </div>

          <div className="flex-1 rounded-lg border border-slate-700 bg-slate-900/60 p-3">
            <div className="text-xs text-slate-400">Righe</div>
            <div className="text-xl font-bold text-white">{lines}</div>
            <div className="mt-1 text-xs text-slate-400">Livello {level}</div>
          </div>

          <div className="flex-1 rounded-lg border border-slate-700 bg-slate-900/60 p-3">
            <div className="mb-2 text-xs text-slate-400">Prossimo</div>
            <div className="flex items-center justify-center">
              <div
                className="grid gap-px"
                style={{
                  gridTemplateColumns: `repeat(${nextMatrix[0].length}, 12px)`,
                }}
              >
                {nextMatrix.flatMap((row, y) =>
                  row.map((cell, x) => (
                    <div
                      key={`n-${y}-${x}`}
                      className={`h-3 w-3 rounded-[2px] ${
                        cell ? COLORS[cell] : "bg-transparent"
                      }`}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="hidden flex-1 rounded-lg border border-slate-700 bg-slate-900/60 p-3 sm:block">
            <div className="text-xs text-slate-400">Record</div>
            <div className="text-xl font-bold text-white">{bestScore}</div>
          </div>
        </div>
      </div>

      {/* COMANDI TOUCH */}
      <div className="flex w-full max-w-[320px] items-center justify-between gap-2 sm:hidden">
        <button
          type="button"
          onClick={() => dispatch({ type: "MOVE", dx: -1 })}
          className="flex h-12 flex-1 items-center justify-center rounded-lg bg-slate-700 text-white active:bg-slate-600"
          aria-label="Sinistra"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "ROTATE" })}
          className="flex h-12 flex-1 items-center justify-center rounded-lg bg-slate-700 text-white active:bg-slate-600"
          aria-label="Ruota"
        >
          <RotateCw className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "SOFT_DROP" })}
          className="flex h-12 flex-1 items-center justify-center rounded-lg bg-slate-700 text-white active:bg-slate-600"
          aria-label="Giu"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "HARD_DROP" })}
          className="flex h-12 flex-1 items-center justify-center rounded-lg bg-slate-700 text-white active:bg-slate-600"
          aria-label="Caduta immediata"
        >
          <ChevronsDown className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: "MOVE", dx: 1 })}
          className="flex h-12 flex-1 items-center justify-center rounded-lg bg-slate-700 text-white active:bg-slate-600"
          aria-label="Destra"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      {/* COMANDI DA TASTIERA */}
      <div className="hidden items-center gap-4 text-xs text-slate-400 sm:flex">
        <span>← → muovi</span>
        <span>↑ ruota</span>
        <span>↓ scendi</span>
        <span>spazio caduta</span>
        <button
          type="button"
          onClick={() => dispatch({ type: "TOGGLE_PAUSE" })}
          disabled={status !== "playing" && status !== "paused"}
          className="flex items-center gap-1 rounded px-2 py-1 text-slate-300 hover:bg-slate-700 disabled:opacity-40"
        >
          <Pause className="h-3 w-3" />P pausa
        </button>
      </div>
    </div>
  );
}
