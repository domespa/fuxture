// ---------------------------------------------------------------------------
// SUGGERIMENTI RICAVATI DALLA CREATIVITA
// Mittente e oggetto stanno gia' scritti dentro il file: il <title> e' quasi
// sempre l'inserzionista, mentre intestazioni, alt delle immagini e prime
// righe di testo sono i candidati naturali per l'oggetto. Tutto in locale,
// sul file appena importato: nessuna chiamata esterna.
// ---------------------------------------------------------------------------

const ENTITA: Record<string, string> = {
  "&nbsp;": " ",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&#039;": "'",
  "&apos;": "'",
};

const decodifica = (testo: string): string =>
  testo
    .replace(
      /&(?:nbsp|amp|lt|gt|quot|#0?39|apos);/gi,
      (m) => ENTITA[m.toLowerCase()] ?? m,
    )
    .replace(/\s+/g, " ")
    .trim();

// "PURINA" -> "Purina": i title sono spesso tutti maiuscoli, e come nome
// mittente sembrerebbe di stare urlando. Le sigle brevi (BMW, ENI) restano
// invece come sono: renderle "Bmw" sarebbe peggio del problema.
const normalizzaMittente = (testo: string): string => {
  const pulito = decodifica(testo);
  if (pulito.length > 3 && pulito === pulito.toUpperCase()) {
    return pulito
      .toLowerCase()
      .replace(
        /(^|[\s'-])([a-zà-ÿ])/g,
        (_m, prima: string, lettera: string) => prima + lettera.toUpperCase(),
      );
  }
  return pulito;
};

// Diciture che compaiono in ogni creativita e non dicono nulla dell'offerta.
const RUMORE =
  /^(advertisement|adv|pubblicit|annulla iscrizione|unsubscribe|informativa|privacy|clicca qui|leggi tutto|logo|banner|immagine|spacer|header|footer)/i;

// Scarta gli avanzi di CSS sopravvissuti allo spoglio dei tag.
const SEMBRA_CODICE = /[{};]|font-family|\d+px|#[0-9a-f]{6}/i;

const utilizzabile = (testo: string, min: number, max: number): boolean =>
  testo.length >= min &&
  testo.length <= max &&
  !RUMORE.test(testo) &&
  !SEMBRA_CODICE.test(testo) &&
  /[a-zà-ÿ]{3}/i.test(testo);

// Un nome mittente lungo quanto una frase non e' un nome mittente.
const MITTENTE_MAX = 28;

const marchioDaTitolo = (titolo: string): string => {
  const pulito = decodifica(titolo);

  // "CheTariffa.it oggi ti propone" -> "CheTariffa.it": quando il title e'
  // una frase, il dominio citato e' quasi sempre l'inserzionista.
  const dominio = pulito.match(/\b[\w-]+\.(?:it|com|net|org|eu)\b/i);
  if (dominio) return normalizzaMittente(dominio[0]);

  if (pulito.length <= MITTENTE_MAX) return normalizzaMittente(pulito);

  // Titolo lungo e senza dominio: restano le prime due parole.
  return normalizzaMittente(pulito.split(" ").slice(0, 2).join(" "));
};

const senzaDuplicati = (voci: string[]): string[] => {
  const visti = new Set<string>();
  return voci.filter((voce) => {
    const chiave = voce.toLowerCase();
    if (visti.has(chiave)) return false;
    visti.add(chiave);
    return true;
  });
};

export interface SuggerimentiCreativita {
  mittenti: string[];
  oggetti: string[];
}

export const ricavaSuggerimenti = (html: string): SuggerimentiCreativita => {
  // Stile e script vanno via per primi, altrimenti il CSS finisce fra i testi.
  const ripulito = html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");

  const titolo = ripulito.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const marchio = titolo ? marchioDaTitolo(titolo) : "";

  const intestazioni = [
    ...ripulito.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi),
  ].map((m) => decodifica(m[1].replace(/<[^>]*>/g, " ")));

  const alt = [...ripulito.matchAll(/\salt\s*=\s*"([^"]+)"/gi)].map((m) =>
    decodifica(m[1]),
  );

  // Spogliato dei tag, ogni blocco diventa una riga a sé.
  const righe = ripulito
    .replace(/<[^>]*>/g, "\n")
    .split("\n")
    .map(decodifica)
    .filter(Boolean);

  const mittenti = senzaDuplicati(
    [marchio, "Fuxture"].filter((voce) => voce && !RUMORE.test(voce)),
  ).slice(0, 3);

  const oggetti = senzaDuplicati(
    [...intestazioni, ...alt, ...righe]
      .filter((voce) => utilizzabile(voce, 12, 90))
      .filter((voce) => voce.toLowerCase() !== marchio.toLowerCase()),
  ).slice(0, 3);

  return { mittenti, oggetti };
};
