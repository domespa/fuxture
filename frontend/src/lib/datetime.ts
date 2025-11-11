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
