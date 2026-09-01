import { useState, type FormEvent } from "react";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
  sanitizePlayerName,
} from "@/hooks/usePlayerName";
import { PANEL_CLASS } from "./theme";

interface PlayerNameGateProps {
  gameTitle: string;
  onConfirm: (name: string) => void;
}

// ====================================================================================================== //
//        Chiesto una volta sola prima della prima partita: serve a firmare il punteggio in classifica.
//        Nessuna email, nessuna registrazione: solo un nickname salvato nel browser.
// ====================================================================================================== //
export default function PlayerNameGate({
  gameTitle,
  onConfirm,
}: PlayerNameGateProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const clean = sanitizePlayerName(name).trim();

    if (clean.length < MIN_NAME_LENGTH) {
      setError(`Servono almeno ${MIN_NAME_LENGTH} caratteri`);
      return;
    }

    onConfirm(clean);
  };

  return (
    <div
      className={`${PANEL_CLASS} flex flex-col items-center justify-center gap-4 px-6 py-12 text-center`}
    >
      <Trophy className="h-10 w-10 text-amber-400" />

      <div>
        <h2 className="text-xl font-bold text-white">
          Come ti chiamiamo in classifica?
        </h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-slate-300">
          Scegli un nickname: comparira nella classifica di {gameTitle} quando
          finisci la partita. Te lo ricordiamo noi, non serve registrarsi.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-2 sm:flex-row"
      >
        <Input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          placeholder="Il tuo nickname"
          maxLength={MAX_NAME_LENGTH}
          autoFocus
          className="flex-1 border-slate-600 bg-slate-900 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
        />
        <Button type="submit">Inizia a giocare</Button>
      </form>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
