import { lazy } from "react";
import type { ComponentType, LazyExoticComponent } from "react";

// RISULTATO DI FINE PARTITA (usato per la CTA newsletter)
export interface GameResult {
  won?: boolean;
  score?: number;
}

export interface GameComponentProps {
  onGameOver?: (result: GameResult) => void;
}

// ====================================================================================================== //
//        REGISTRY GIOCHI INTERNI
//        La chiave va inserita nel campo "entryPath" del gioco creato dalla dashboard.
//        Ogni gioco e caricato in lazy: non pesa sul bundle principale del blog.
// ====================================================================================================== //
export const GAME_REGISTRY: Record<
  string,
  LazyExoticComponent<ComponentType<GameComponentProps>>
> = {
  "parola-del-giorno": lazy(() => import("./ParolaDelGiorno")),
  riflessi: lazy(() => import("./Riflessi")),
};

export const getGameComponent = (entryPath: string | null) => {
  if (!entryPath) return null;
  return GAME_REGISTRY[entryPath] ?? null;
};

export const REGISTRY_KEYS = Object.keys(GAME_REGISTRY);
