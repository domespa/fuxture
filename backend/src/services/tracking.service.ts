// ====================================================================================================== //
//                        TRACKING PIXEL - ADEGUAMENTO LINEE GUIDA GARANTE
//
// Provvedimento del Garante del 17 aprile 2026 ("Linee Guida in materia di
// utilizzo di tracking pixel nelle comunicazioni di posta elettronica"),
// pubblicato in G.U. il 29 aprile 2026, termine di adeguamento 29 ottobre 2026.
//
// Due obblighi hanno una ricaduta diretta sul codice di invio:
//
// 1. L'interessato deve poter revocare il consenso al SOLO tracciamento
//    continuando a ricevere le comunicazioni, e in tal caso "dovra' essere
//    garantita la piena fruibilita' del servizio, che non dovra' comunque
//    subire, per questa sola ragione, alcuna limitazione" (par. 6).
//    Da qui stripTrackingPixels(): rimuove i marcatori lasciando intatta la
//    creativita' grafica.
//
// 2. L'indirizzo e-mail non deve essere "ricompreso nella richiesta tecnica
//    generata dal caricamento del pixel"; il mittente deve invece generare
//    "un identificativo inintelligibile e non sequenziale" e mantenere la
//    corrispondenza "in un layer interno e separato" (par. 6, privacy by
//    design ex art. 25 GDPR).
//    Da qui applyTrackingMacros(): sostituisce le macro {email} presenti
//    nelle creativita' di terzi con il trackingId opaco del destinatario.
// ====================================================================================================== //

// HOST LA CUI UNICA FUNZIONE E' IL TRACCIAMENTO.
// Il Garante rileva che "non consta l'esistenza di una standardizzazione dei
// nomi dei tracking pixel, ne' esiste allo stato attuale una loro codifica,
// ne' una sintassi universalmente condivise" (par. 1): non esiste quindi un
// modo automatico di riconoscerli e l'elenco va aggiornato a mano a ogni
// nuova creativita' ricevuta da inserzionisti, agenzie e centri media.
// NON inserire qui host che veicolano anche immagini grafiche (loghi,
// fotografie): quelli vengono gestiti dalle regole successive.
export const TRACKING_HOSTS: string[] = [
  "afinia.uinterbox.com",
  "anetit.tradedoubler.com",
  "centurymedia360.go2cloud.org",
  "cert.home4four.com",
  "chetariffa.go2cloud.org",
  "direct.ewrite.it",
  "direct.juiceadv.com",
  "direct.ukuphikelela.com",
  "fwd.veklink.com",
  "gcjjdje.r.af.d.sendibt2.com",
  "go.ketchupadv.it",
  "imp.tradedoubler.com",
  "ispd.uinterbox.com",
  "kataisa.uinterbox.com",
  "rdr.mivfwd.com",
  "track.adform.net",
  "track.adtraction.com",
  "track.perfoss.com",
  "tracking.adgoon.it",
  "tracking.ama-dem.it",
  "tracking.cubusion.com",
  "tracking.netmediaclick.it",
  "tracking.performagency.it",
  "tracking.performoney.it",
  "tracking.trkadviceme.com",
  "trck.adgoaffiliation-it.com",
  "trk.adplayon.com",
  "trk.webdataconsulting.eu",
  "webdataconsulting.fr",
  "webperformance.imp2aff.com",
  "www.awin1.com",
  "www.financeads.net",
];

// PATH RICORRENTI DELLE PIATTAFORME DI AFFILIAZIONE: coprono anche gli host
// non ancora censiti nell'elenco precedente.
export const TRACKING_PATH_PATTERNS: RegExp[] = [
  /\/aff_i\b/i, // impression pixel (HasOffers / Affise e derivati)
  /\/aff_c\b/i, // click tracker
  /\/v2\/open\//i, // open tracking per destinatario
  /\/tracking\/imp\b/i,
  /\/open\.(?:aspx|gif|png|php)\b/i,
  /\/(?:beacon|webbeacon|openpixel|trackopen)\b/i,
];

// IMMAGINI DI IMPAGINAZIONE: sono 1x1 ma non tracciano nulla, e rimuoverle
// sposta il layout della creativita'. Vanno preservate.
const LAYOUT_PIXEL_PATTERN =
  /\/(?:spacer|blank|clear|shim|trasparente|pixel)\.(?:gif|png)(?:$|\?)/i;

// MACRO CON CUI LE CREATIVITA' DI TERZI CHIEDONO L'INDIRIZZO DEL DESTINATARIO.
// Vengono sostituite con l'identificativo opaco, mai con l'e-mail.
const EMAIL_MACRO_PATTERN = /\{\{?\s*email\s*\}?\}|%%\s*email\s*%%|\[\s*email\s*\]/gi;

const IMG_TAG_PATTERN = /<img\b[^>]*>/gi;

// ATTRIBUTI LETTI DAI TAG <img>. Le espressioni sono precompilate una per
// attributo invece di essere costruite a runtime da una stringa: e' piu'
// prevedibile e non espone il parsing a errori di escaping.
type AttributeName = "src" | "href" | "width" | "height" | "style";

const ATTRIBUTE_PATTERNS: Record<AttributeName, RegExp> = {
  src: /\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i,
  href: /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i,
  width: /\bwidth\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i,
  height: /\bheight\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i,
  style: /\bstyle\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i,
};

// ESTRAE IL VALORE DI UN ATTRIBUTO DA UN TAG
const getAttribute = (tag: string, name: AttributeName): string | null => {
  const match = tag.match(ATTRIBUTE_PATTERNS[name]);
  if (!match) return null;
  return match[1] ?? match[2] ?? match[3] ?? null;
};

// UN VALORE DI width/height CHE VALE 1 O 0 (ANCHE "1px")
const isHairline = (value: string | null): boolean => {
  if (value === null) return false;
  const parsed = parseInt(value.trim(), 10);
  return parsed === 0 || parsed === 1;
};

// DICHIARAZIONE CSS width/height PARI A 0 O 1 PIXEL.
// L'ancoraggio a inizio dichiarazione e' necessario: senza, la regola
// intercetta anche "line-height: 0px", che nelle creativita' DEM compare
// su immagini a tutti gli effetti visibili.
const HAIRLINE_STYLE_PATTERN =
  /(?:^|;)\s*(?:width|height)\s*:\s*(?:0|1)(?:\.0+)?\s*px\s*(?:;|$)/i;

// RICONOSCE UN MARCATORE DI TRACCIAMENTO
export const isTrackingImage = (tag: string): boolean => {
  const src = getAttribute(tag, "src");
  if (!src) return false;

  // LE IMMAGINI DI IMPAGINAZIONE RESTANO
  if (LAYOUT_PIXEL_PATTERN.test(src)) return false;

  // HOST CENSITO
  let host = "";
  try {
    host = new URL(src, "https://placeholder.invalid").hostname.toLowerCase();
  } catch {
    return false;
  }
  if (TRACKING_HOSTS.includes(host)) return true;

  // PATH TIPICO DELLE PIATTAFORME DI AFFILIAZIONE
  if (TRACKING_PATH_PATTERNS.some((pattern) => pattern.test(src))) return true;

  // EURISTICA DI ULTIMA ISTANZA: immagine invisibile servita da un host esterno.
  // Serve a intercettare i marcatori di host non ancora censiti, che il
  // provvedimento da' per scontato non siano riconoscibili a priori.
  const style = getAttribute(tag, "style") ?? "";
  const hairlineStyle = HAIRLINE_STYLE_PATTERN.test(style);
  if (
    (isHairline(getAttribute(tag, "width")) &&
      isHairline(getAttribute(tag, "height"))) ||
    hairlineStyle
  ) {
    return true;
  }

  return false;
};

// RIMUOVE I MARCATORI DALLA CREATIVITA' LASCIANDO INTATTO IL RESTO
export const stripTrackingPixels = (
  html: string
): { html: string; removed: string[] } => {
  const removed: string[] = [];

  const cleaned = html.replace(IMG_TAG_PATTERN, (tag) => {
    if (!isTrackingImage(tag)) return tag;
    removed.push(getAttribute(tag, "src") ?? "(src assente)");
    return "";
  });

  return { html: cleaned, removed };
};

// SOSTITUISCE LE MACRO {email} CON L'IDENTIFICATIVO OPACO DEL DESTINATARIO.
// Interviene solo dentro src e href, cioe' dove la macro finisce in una
// richiesta di rete: il corpo del messaggio non viene toccato. Sono
// gestiti anche gli attributi privi di virgolette, che diverse creativita'
// di terzi utilizzano.
export const applyTrackingMacros = (html: string, trackingId: string): string =>
  html.replace(
    /\b(src|href)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi,
    (
      whole: string,
      attribute: string,
      doubleQuoted?: string,
      singleQuoted?: string,
      unquoted?: string
    ) => {
      const quote =
        doubleQuoted !== undefined ? '"' : singleQuoted !== undefined ? "'" : "";
      const value = doubleQuoted ?? singleQuoted ?? unquoted ?? "";

      EMAIL_MACRO_PATTERN.lastIndex = 0;
      if (!EMAIL_MACRO_PATTERN.test(value)) return whole;

      EMAIL_MACRO_PATTERN.lastIndex = 0;
      const replaced = value.replace(
        EMAIL_MACRO_PATTERN,
        encodeURIComponent(trackingId)
      );
      return `${attribute}=${quote}${replaced}${quote}`;
    }
  );

// PREPARA IL CORPO DEL MESSAGGIO PER UN SINGOLO DESTINATARIO.
// E' l'unico punto da cui dovrebbe passare la personalizzazione di un invio:
// applica le macro e, se il destinatario ha revocato il consenso al solo
// tracciamento, rimuove i marcatori continuando a recapitargli la campagna.
export const personalizeForRecipient = (
  html: string,
  recipient: { trackingId: string; trackingConsent: boolean }
): { html: string; strippedPixels: string[] } => {
  const withMacros = applyTrackingMacros(html, recipient.trackingId);

  if (recipient.trackingConsent) {
    return { html: withMacros, strippedPixels: [] };
  }

  const { html: cleaned, removed } = stripTrackingPixels(withMacros);
  return { html: cleaned, strippedPixels: removed };
};
