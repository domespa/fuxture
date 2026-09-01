import type { LeaderboardPeriod } from "@prisma/client";

const TIMEZONE = "Europe/Rome";

// ====================================================================================================== //
//        Chiave del periodo di classifica.
//        DAILY usa la data italiana, la stessa con cui il frontend sceglie la parola del giorno:
//        cosi la classifica cambia esattamente quando cambia la parola, non a mezzanotte UTC.
// ====================================================================================================== //
export const getDateKey = (date: Date = new Date()): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

export const getPeriodKey = (period: LeaderboardPeriod): string =>
  period === "DAILY" ? getDateKey() : "all";

// ====================================================================================================== //
//                                 PULIZIA NOME GIOCATORE
// ====================================================================================================== //
export const MIN_NAME_LENGTH = 2;
export const MAX_NAME_LENGTH = 16;

export const sanitizePlayerName = (value: unknown): string =>
  String(value ?? "")
    .replace(/[^\p{L}\p{N} _.-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_NAME_LENGTH);

export const sanitizeDetail = (value: unknown): string | null => {
  if (value === undefined || value === null) return null;

  const clean = String(value)
    .replace(/[\p{C}]/gu, "")
    .trim()
    .slice(0, 40);

  return clean || null;
};
