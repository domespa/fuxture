/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // Aggiungi altre variabili d'ambiente qui in futuro
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
