// ====================================================================================================== //
//                        FILTRO DEI NOMI NELLE CLASSIFICHE
//
// Il nome giocatore e' un campo pubblico, scritto da chiunque e senza account:
// e' il posto naturale in cui compaiono insulti e slur. sanitizePlayerName()
// ripulisce i caratteri ammessi ma non guarda il contenuto, quindi serve un
// controllo separato sulle parole.
//
// L'aggiramento tipico non e' scrivere la parola per intero: e' spezzarla
// ("c.o.g.l.i.o.n.e"), sostituire lettere con cifre ("c0gl10n3") o allungarla
// ("cogliooone"). Per questo il confronto avviene su una forma normalizzata,
// applicata sia al nome in ingresso sia ai termini dell'elenco: cosi le due
// parti restano allineate anche quando l'elenco viene modificato.
// ====================================================================================================== //

// SOSTITUZIONI LEET PIU' DIFFUSE
const LEET_MAP: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "8": "b",
  "@": "a",
  $: "s",
  "!": "i",
  "|": "i",
};

// Riduce una stringa alla sola sequenza di lettere significative:
// minuscole, senza accenti, senza cifre-sostituto, senza separatori, senza
// ripetizioni. "C0-G-L-I-O-N-EEE" e "coglione" collassano entrambe su
// "coglione".
export const normalizeForMatch = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[01345789@$!|]/g, (char) => LEET_MAP[char] ?? "")
    .replace(/[^a-z]/g, "")
    .replace(/(.)\1+/g, "$1");

// ELENCO DEI TERMINI NON AMMESSI.
// Va tenuto aggiornato: nessun elenco statico copre tutto, e le varianti
// nascono in fretta. I termini si scrivono in chiaro, la normalizzazione al
// confronto pensa alle varianti.
//
// Il confronto e' per sottostringa, quindi termini corti possono generare
// falsi positivi su nomi legittimi (per esempio un cognome che li contiene).
// E' un compromesso accettabile su un campo di fantasia come il nickname di
// una classifica, dove il costo di un rifiuto e' riscrivere il nome.
export const BANNED_WORDS: string[] = [
  // insulti e volgarita' italiane
  "cazzo",
  "coglione",
  "coglioni",
  "stronzo",
  "stronza",
  "merda",
  "vaffanculo",
  "fanculo",
  "inculo",
  "minchia",
  "figa",
  "troia",
  "puttana",
  "zoccola",
  "mignotta",
  "bastardo",
  "sborra",
  "pompino",
  "scopare",
  "pisello",
  // bestemmie
  "porcodio",
  "diocane",
  "dioporco",
  "madonnaputtana",
  "porcamadonna",
  // slur razzisti ed etnici
  "negro",
  "negri",
  "negra",
  "sporconegro",
  "terrone",
  "zingaro",
  "zingara",
  "crucco",
  "marocchino",
  "nigger",
  "nigga",
  // slur omotransfobici
  "frocio",
  "froci",
  "ricchione",
  "checca",
  "faggot",
  "tranny",
  // abilismo
  "mongoloide",
  "handicappato",
  "ritardato",
  "retard",
  // riferimenti nazisti
  "hitler",
  "nazista",
  "duce",
  "mussolini",
  "svastica",
  // volgarita' inglesi piu' comuni
  "fuck",
  "shit",
  "bitch",
  "cunt",
  "whore",
  "rape",
  "pussy",
  "dick",
];

// L'elenco viene normalizzato una volta sola all'avvio, con la stessa funzione
// applicata all'input: se un termine si annulla del tutto viene scartato,
// altrimenti bloccherebbe qualunque nome.
const NORMALIZED_BANNED: Array<{ word: string; normalized: string }> =
  BANNED_WORDS.map((word) => ({ word, normalized: normalizeForMatch(word) }))
    .filter((entry) => entry.normalized.length >= 3);

// Restituisce il termine che ha fatto scattare il blocco, o null.
// Il termine serve al log lato server: al giocatore non viene mostrato,
// altrimenti l'elenco diventerebbe una mappa per aggirarlo.
export const findBannedWord = (value: string): string | null => {
  const normalized = normalizeForMatch(value);
  if (!normalized) return null;

  const match = NORMALIZED_BANNED.find((entry) =>
    normalized.includes(entry.normalized)
  );

  return match ? match.word : null;
};

export const containsBannedWord = (value: string): boolean =>
  findBannedWord(value) !== null;
