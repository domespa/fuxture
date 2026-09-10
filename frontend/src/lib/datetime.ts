// ============================================================================
// FORMATTAZIONE DELLE DATE
//
// La stessa chiamata a toLocaleDateString("it-IT", ...) era ripetuta in nove
// file, ognuno con la propria variante di formato e il proprio modo di
// trattare il valore nullo. Il risultato erano date scritte in modi diversi
// da una pagina all'altra senza che nessuno l'avesse deciso.
//
// Due formati coprono tutto il sito:
//   breve  -> "10 set 2026", per elenchi e schede
//   esteso -> "10 settembre 2026", per la pagina dell'articolo
// ============================================================================

type DateInput = Date | string | null | undefined;

const format = (
  value: DateInput,
  options: Intl.DateTimeFormatOptions
): string => {
  if (!value) return "";

  const date = new Date(value);

  // Una stringa non interpretabile darebbe "Invalid Date" stampato a video.
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("it-IT", options);
};

// "10 set 2026"
export const formatDateShort = (value: DateInput): string =>
  format(value, { day: "2-digit", month: "short", year: "numeric" });

// "10 settembre 2026"
export const formatDateLong = (value: DateInput): string =>
  format(value, { day: "2-digit", month: "long", year: "numeric" });

// "10 set" - senza anno, per gli elenchi compatti
export const formatDayMonth = (value: DateInput): string =>
  format(value, { day: "2-digit", month: "short" });

// FUNZIONE PER CONVERTIRE UNA DATA UTC IN DATA LOCALE(ITALIANA)
export const utcToLocal = (utcDate: string | Date): string => {
  const date = new Date(utcDate);

  const offesetMs = date.getTimezoneOffset() * 60000;

  const localDate = new Date(date.getTime() - offesetMs);

  // Formato: YYYY-MM-DDTHH:mm
  return localDate.toISOString().slice(0, 16);
};

// INVERSO
export const localToUtc = (localDate: string): Date => {
  return new Date(localDate);
};
