import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Share2, RotateCcw, Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GameComponentProps } from "./registry";

// ====================================================================================================== //
//                                       PAROLE (5 LETTERE)
//        Il filtro finale evita che una parola di lunghezza sbagliata rompa il gioco.
// ====================================================================================================== //
const RAW_WORDS = [
  "amico", "amore", "ampio", "anima", "arena", "aroma", "banco", "barca",
  "bosco", "breve", "bruno", "calma", "campo", "canto", "carta", "cassa",
  "cesto", "cielo", "circo", "colle", "colpo", "conto", "corda", "corpo",
  "corsa", "corso", "costa", "crema", "cuore", "denso", "dente", "dolce",
  "donna", "dorso", "fango", "fatto", "ferro", "festa", "fiore", "firma",
  "fiume", "folla", "fondo", "forma", "forno", "forte", "fossa", "freno",
  "gatto", "gente", "gesto", "gioco", "gioia", "globo", "gnomo", "gonna",
  "grado", "grano", "guida", "gusto", "isola", "lampo", "largo", "latte",
  "legno", "letto", "libro", "lieto", "linea", "lista", "luogo", "madre",
  "magia", "mania", "marca", "massa", "matto", "mazzo", "mente", "merlo",
  "messa", "metro", "mille", "mondo", "monte", "morte", "mosca", "mucca",
  "muffa", "nervo", "norma", "notte", "oliva", "ombra", "opera", "palco",
  "palla", "panca", "panno", "parco", "parte", "passo", "pasta", "patto",
  "pausa", "pazzo", "pelle", "penna", "pesca", "pezzo", "piano", "picco",
  "piede", "pieno", "pinza", "piuma", "poema", "pollo", "polso", "ponte",
  "porta", "posta", "pozzo", "prato", "presa", "prete", "primo", "prova",
  "punto", "quota", "radio", "rango", "razza", "regno", "resto", "ricco",
  "ritmo", "rombo", "rosso", "rotta", "ruota", "sacco", "salto", "sasso",
  "scala", "scena", "scopo", "scuro", "secco", "segno", "senso", "serie",
  "servo", "sette", "sfida", "sogno", "soldi", "solco", "sorte", "spada",
  "spesa", "spina", "sport", "stato", "stile", "stima", "suono", "tacco",
  "tanto", "tappo", "tasca", "tasto", "tempo", "tenda", "terra", "testa",
  "tetto", "tigre", "tomba", "tondo", "torre", "torta", "tosse", "treno",
  "trono", "trota", "turno", "umore", "unico", "usura", "vento", "verde",
  "verso", "vetro", "vetta", "video", "vigna", "viola", "virus", "vista",
  "visto", "volpe", "volto", "vuoto", "zappa", "zebra", "zeppa", "zolla",
  "zucca",
];

const WORDS = RAW_WORDS.filter((word) => word.length === 5);

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;
const EPOCH = Date.UTC(2024, 0, 1);
const STORAGE_PREFIX = "fuxture-parola-";

const KEYBOARD_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["INVIO", "z", "x", "c", "v", "b", "n", "m", "CANC"],
];

type LetterState = "correct" | "present" | "absent";
type GameStatus = "playing" | "won" | "lost";

// ====================================================================================================== //
//                                       PAROLA DEL GIORNO
// ====================================================================================================== //
const getDayIndex = (): number => {
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor((today - EPOCH) / 86400000);
};

// ====================================================================================================== //
//                        VALUTAZIONE TENTATIVO (gestisce le lettere doppie)
// ====================================================================================================== //
const evaluateGuess = (guess: string, solution: string): LetterState[] => {
  const result: LetterState[] = Array(WORD_LENGTH).fill("absent");
  const solutionChars = solution.split("");
  const consumed = Array(WORD_LENGTH).fill(false);

  // PRIMO GIRO: LETTERE AL POSTO GIUSTO
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === solutionChars[i]) {
      result[i] = "correct";
      consumed[i] = true;
    }
  }

  // SECONDO GIRO: LETTERE PRESENTI MA SPOSTATE
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === "correct") continue;
    const match = solutionChars.findIndex(
      (char, index) => !consumed[index] && char === guess[i]
    );
    if (match !== -1) {
      result[i] = "present";
      consumed[match] = true;
    }
  }

  return result;
};

const CELL_STYLES: Record<LetterState, string> = {
  correct: "bg-emerald-500 border-emerald-500 text-white",
  present: "bg-amber-400 border-amber-400 text-white",
  absent: "bg-gray-400 border-gray-400 text-white",
};

const KEY_STYLES: Record<LetterState, string> = {
  correct: "bg-emerald-500 text-white",
  present: "bg-amber-400 text-white",
  absent: "bg-gray-400 text-white",
};

export default function ParolaDelGiorno({ onGameOver }: GameComponentProps) {
  const dayIndex = useMemo(() => getDayIndex(), []);
  const solution = useMemo(
    () => WORDS[((dayIndex % WORDS.length) + WORDS.length) % WORDS.length],
    [dayIndex]
  );
  const storageKey = `${STORAGE_PREFIX}${dayIndex}`;

  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [status, setStatus] = useState<GameStatus>("playing");
  const [shake, setShake] = useState(false);

  // RIPRENDI LA PARTITA DI OGGI
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return;
      const parsed = JSON.parse(saved) as {
        guesses: string[];
        status: GameStatus;
      };
      if (Array.isArray(parsed.guesses)) {
        setGuesses(parsed.guesses);
        setStatus(parsed.status ?? "playing");
      }
    } catch {
      // STORAGE NON DISPONIBILE: SI GIOCA COMUNQUE
    }
  }, [storageKey]);

  const persist = useCallback(
    (nextGuesses: string[], nextStatus: GameStatus) => {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({ guesses: nextGuesses, status: nextStatus })
        );
      } catch {
        // STORAGE NON DISPONIBILE
      }
    },
    [storageKey]
  );

  // STATO DI OGNI LETTERA PER LA TASTIERA
  const letterStates = useMemo(() => {
    const states: Record<string, LetterState> = {};
    const priority: Record<LetterState, number> = {
      absent: 0,
      present: 1,
      correct: 2,
    };

    guesses.forEach((guess) => {
      evaluateGuess(guess, solution).forEach((state, index) => {
        const letter = guess[index];
        const known = states[letter];
        if (!known || priority[state] > priority[known]) {
          states[letter] = state;
        }
      });
    });

    return states;
  }, [guesses, solution]);

  const submitGuess = useCallback(() => {
    if (status !== "playing") return;

    if (current.length !== WORD_LENGTH) {
      setShake(true);
      toast.error(`Servono ${WORD_LENGTH} lettere`);
      return;
    }

    if (!WORDS.includes(current)) {
      setShake(true);
      toast.error("Parola non presente in elenco");
      return;
    }

    const nextGuesses = [...guesses, current];
    const nextStatus: GameStatus =
      current === solution
        ? "won"
        : nextGuesses.length >= MAX_ATTEMPTS
          ? "lost"
          : "playing";

    setGuesses(nextGuesses);
    setCurrent("");
    setStatus(nextStatus);
    persist(nextGuesses, nextStatus);

    if (nextStatus === "won") {
      toast.success("Indovinata! Complimenti");
      onGameOver?.({ won: true, score: nextGuesses.length });
    } else if (nextStatus === "lost") {
      toast(`La parola era "${solution.toUpperCase()}"`);
      onGameOver?.({ won: false, score: nextGuesses.length });
    }
  }, [current, guesses, onGameOver, persist, solution, status]);

  const handleKey = useCallback(
    (key: string) => {
      if (status !== "playing") return;

      if (key === "INVIO") {
        submitGuess();
        return;
      }

      if (key === "CANC") {
        setCurrent((prev) => prev.slice(0, -1));
        return;
      }

      if (/^[a-z]$/.test(key)) {
        setCurrent((prev) =>
          prev.length >= WORD_LENGTH ? prev : prev + key
        );
      }
    },
    [status, submitGuess]
  );

  // TASTIERA FISICA
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      if (event.key === "Enter") {
        handleKey("INVIO");
      } else if (event.key === "Backspace") {
        handleKey("CANC");
      } else {
        const letter = event.key.toLowerCase();
        if (/^[a-z]$/.test(letter)) handleKey(letter);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleKey]);

  // RESET ANIMAZIONE ERRORE
  useEffect(() => {
    if (!shake) return;
    const timer = setTimeout(() => setShake(false), 400);
    return () => clearTimeout(timer);
  }, [shake]);

  // CONDIVISIONE RISULTATO
  const handleShare = async () => {
    const grid = guesses
      .map((guess) =>
        evaluateGuess(guess, solution)
          .map((state) =>
            state === "correct" ? "🟩" : state === "present" ? "🟨" : "⬜"
          )
          .join("")
      )
      .join("\n");

    const text = `Parola del Giorno #${dayIndex} ${
      status === "won" ? guesses.length : "X"
    }/${MAX_ATTEMPTS}\n\n${grid}\n\n${window.location.href}`;

    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("Risultato copiato negli appunti");
      }
    } catch {
      toast.error("Impossibile condividere il risultato");
    }
  };

  const handleReset = () => {
    setGuesses([]);
    setCurrent("");
    setStatus("playing");
    persist([], "playing");
  };

  // GRIGLIA: TENTATIVI FATTI + TENTATIVO CORRENTE + RIGHE VUOTE
  const rows = Array.from({ length: MAX_ATTEMPTS }, (_, rowIndex) => {
    if (rowIndex < guesses.length) {
      return {
        letters: guesses[rowIndex].split(""),
        states: evaluateGuess(guesses[rowIndex], solution),
        isCurrent: false,
      };
    }
    if (rowIndex === guesses.length && status === "playing") {
      return {
        letters: current.padEnd(WORD_LENGTH, " ").split(""),
        states: null,
        isCurrent: true,
      };
    }
    return {
      letters: Array(WORD_LENGTH).fill(" "),
      states: null,
      isCurrent: false,
    };
  });

  return (
    <div className="flex flex-col items-center gap-6">
      {/* GRIGLIA */}
      <div className="grid gap-1.5">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`flex gap-1.5 ${
              shake && row.isCurrent ? "animate-pulse" : ""
            }`}
          >
            {row.letters.map((letter, cellIndex) => (
              <div
                key={cellIndex}
                className={`flex h-12 w-12 items-center justify-center rounded-md border-2 text-xl font-bold uppercase sm:h-14 sm:w-14 sm:text-2xl ${
                  row.states
                    ? CELL_STYLES[row.states[cellIndex]]
                    : letter.trim()
                      ? "border-gray-400 bg-white text-gray-900"
                      : "border-gray-200 bg-white text-gray-900"
                }`}
              >
                {letter.trim()}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ESITO */}
      {status !== "playing" && (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-lg font-semibold text-gray-900">
            {status === "won"
              ? `Indovinata in ${guesses.length} tentativi!`
              : `Niente da fare: era ${solution.toUpperCase()}`}
          </p>
          <div className="flex gap-2">
            <Button onClick={handleShare} variant="default">
              <Share2 className="mr-2 h-4 w-4" />
              Condividi
            </Button>
            <Button onClick={handleReset} variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              Rigioca
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Una parola nuova ogni giorno a mezzanotte.
          </p>
        </div>
      )}

      {/* TASTIERA */}
      <div className="flex w-full max-w-lg flex-col gap-1.5">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1.5">
            {row.map((key) => {
              const isAction = key === "INVIO" || key === "CANC";
              const state = letterStates[key];

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKey(key)}
                  disabled={status !== "playing"}
                  className={`flex h-12 items-center justify-center rounded-md text-sm font-semibold uppercase transition-colors disabled:opacity-50 ${
                    isAction ? "px-3 text-xs" : "flex-1 min-w-0"
                  } ${
                    state
                      ? KEY_STYLES[state]
                      : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                  }`}
                  aria-label={key === "CANC" ? "Cancella" : key}
                >
                  {key === "CANC" ? <Delete className="h-4 w-4" /> : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
