import { Loader2, Trophy } from "lucide-react";
import type { GameScore, LeaderboardPeriod } from "@/types/game.types";
import { PANEL_CLASS } from "./theme";

interface LeaderboardProps {
  period: LeaderboardPeriod;
  scores: GameScore[];
  isLoading: boolean;
  highlightName?: string;
  playerRank?: number | null;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard({
  period,
  scores,
  isLoading,
  highlightName,
  playerRank,
}: LeaderboardProps) {
  return (
    <aside className={`${PANEL_CLASS} p-5`}>
      <div className="mb-1 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-amber-400" />
        <h2 className="text-lg font-bold text-white">Classifica</h2>
      </div>

      <p className="mb-4 text-xs text-slate-400">
        {period === "DAILY"
          ? "I migliori 10 di oggi. Si azzera a mezzanotte."
          : "I 10 punteggi piu alti di sempre."}
      </p>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
        </div>
      ) : scores.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">
          Nessun punteggio
          {period === "DAILY" ? " oggi" : ""}. Puoi essere il primo.
        </p>
      ) : (
        <ol className="space-y-1">
          {scores.map((entry) => {
            const isPlayer =
              !!highlightName && entry.playerName === highlightName;

            return (
              <li
                key={entry.id}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                  isPlayer
                    ? "bg-blue-500/15 ring-1 ring-blue-400/40"
                    : "hover:bg-slate-700/40"
                }`}
              >
                <span className="w-6 shrink-0 text-center text-sm font-bold text-slate-400">
                  {MEDALS[entry.position - 1] ?? entry.position}
                </span>

                <div className="min-w-0 flex-1">
                  <div
                    className={`truncate text-sm font-medium ${
                      isPlayer ? "text-blue-300" : "text-white"
                    }`}
                  >
                    {entry.playerName}
                  </div>
                  {entry.detail && (
                    <div className="truncate text-xs text-slate-400">
                      {entry.detail}
                    </div>
                  )}
                </div>

                <span className="shrink-0 text-sm font-bold text-white">
                  {entry.score}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {/* POSIZIONE FUORI DALLA TOP 10 */}
      {playerRank != null && playerRank > scores.length && (
        <p className="mt-4 border-t border-slate-700 pt-3 text-center text-xs text-slate-400">
          Sei in posizione{" "}
          <span className="font-bold text-white">{playerRank}</span>. Ancora un
          tentativo per entrare in classifica.
        </p>
      )}
    </aside>
  );
}
