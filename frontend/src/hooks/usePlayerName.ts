import { useCallback, useState } from "react";

const STORAGE_KEY = "fuxture-player-name";

export const MIN_NAME_LENGTH = 2;
export const MAX_NAME_LENGTH = 16;

export const sanitizePlayerName = (value: string): string =>
  value
    .replace(/[^\p{L}\p{N} _.-]/gu, "")
    .replace(/\s+/g, " ")
    .slice(0, MAX_NAME_LENGTH);

// ====================================================================================================== //
//        Il nome viene chiesto una volta sola e poi ricordato nel browser:
//        chi torna il giorno dopo trova gia il suo nickname e gioca senza attriti.
// ====================================================================================================== //
export function usePlayerName() {
  const [playerName, setStoredName] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) ?? "";
    } catch {
      return "";
    }
  });

  const setPlayerName = useCallback((value: string) => {
    const clean = sanitizePlayerName(value).trim();
    setStoredName(clean);

    try {
      if (clean) {
        localStorage.setItem(STORAGE_KEY, clean);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // STORAGE NON DISPONIBILE: IL NOME VALE SOLO PER QUESTA SESSIONE
    }
  }, []);

  return { playerName, setPlayerName };
}
