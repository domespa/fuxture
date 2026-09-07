// ============================================================================
// ARTICOLI VISTI DI RECENTE
//
// Tenuti in localStorage, quindi sul dispositivo di chi legge: non passano mai
// dal server, non finiscono in nessun database e non costituiscono
// profilazione. E' coerente con quanto dichiara la Privacy Policy, e per
// questo la sezione in home non richiede alcun consenso.
//
// Ogni accesso e' protetto da try/catch: in navigazione privata, con i dati
// del sito bloccati o in alcune anteprime, il solo leggere localStorage
// solleva un'eccezione. In quel caso la funzionalita' sparisce senza rumore.
// ============================================================================

const STORAGE_KEY = "fuxture:recent-posts";
const MAX_ENTRIES = 6;

export interface RecentPost {
  slug: string;
  title: string;
  viewedAt: number;
}

const read = (): RecentPost[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (entry): entry is RecentPost =>
        !!entry &&
        typeof entry === "object" &&
        typeof (entry as RecentPost).slug === "string" &&
        typeof (entry as RecentPost).title === "string"
    );
  } catch {
    return [];
  }
};

// Registra un articolo appena aperto, in testa e senza duplicati.
export const rememberPost = (post: { slug: string; title: string }): void => {
  if (!post.slug || !post.title) return;

  try {
    const entries = read().filter((entry) => entry.slug !== post.slug);

    entries.unshift({
      slug: post.slug,
      title: post.title,
      viewedAt: Date.now(),
    });

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(entries.slice(0, MAX_ENTRIES))
    );
  } catch {
    // Spazio esaurito o storage non disponibile: si rinuncia in silenzio.
  }
};

export const getRecentPosts = (limit = 3): RecentPost[] =>
  read().slice(0, limit);

export const clearRecentPosts = (): void => {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // niente da fare
  }
};
