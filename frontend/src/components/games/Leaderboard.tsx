import { Loader2, Trophy } from "lucide-react";
import type { GameScore, LeaderboardPeriod } from "@/types/game.types";

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
    <aside className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-1 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-amber-500" />
        <h2 className="text-lg font-bold text-gray-900">Classifica</h2>
      </div>

      <p className="mb-4 text-xs text-gray-500">
        {period === "DAILY"
          ? "I migliori 10 di oggi. Si azzera a mezzanotte."
          : "I 10 punteggi piu alti di sempre."}
      </p>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        </div>
      ) : scores.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">
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
                  isPlayer ? "bg-blue-50 ring-1 ring-blue-200" : ""
                }`}
              >
                <span className="w-6 shrink-0 text-center text-sm font-bold text-gray-500">
                  {MEDALS[entry.position - 1] ?? entry.position}
                </span>

                <div className="min-w-0 flex-1">
                  <div
                    className={`truncate text-sm font-medium ${
                      isPlayer ? "text-blue-700" : "text-gray-900"
                    }`}
                  >
                    {entry.playerName}
                  </div>
                  {entry.detail && (
                    <div className="truncate text-xs text-gray-500">
                      {entry.detail}
                    </div>
                  )}
                </div>

                <span className="shrink-0 text-sm font-bold text-gray-900">
                  {entry.score}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {/* POSIZIONE FUORI DALLA TOP 10 */}
      {playerRank != null && playerRank > scores.length && (
        <p className="mt-4 border-t border-gray-100 pt-3 text-center text-xs text-gray-500">
          Sei in posizione <span className="font-bold">{playerRank}</span>.
          Ancora un tentativo per entrare in classifica.
        </p>
      )}
    </aside>
  );
}
