// ============================================================================
// TESTO DEL CONSENSO
//
// Le Linee Guida del Garante del 17/04/2026 in materia di tracking pixel
// ammettono un consenso unico: "il consenso alla ricezione degli strumenti di
// tracciamento in questione possa, in linea di principio, essere ricompreso in
// quello, piu' generale, alla ricezione delle comunicazioni promozionali, in
// modo da consentire che la persona esprima a tal fine un unico consenso
// informato" (par. 6). Non servono quindi due caselle: serve che la casella
// unica dica anche del tracciamento, e che la richiesta sia "formulata in modo
// neutro e privo di forzature". La granularita' richiesta dal provvedimento
// sta sul lato della revoca, ed e' assicurata dall'area preferenze.
//
// Il consenso deve pero' coprire cio' che viene effettivamente inviato. Le
// comunicazioni comprendono creativita' di inserzionisti terzi, che e' marketing
// per conto di terzi ai sensi dell'art. 130 del Codice: va dichiarato qui, e
// con esso i pixel di quegli inserzionisti, altrimenti il consenso raccolto e'
// piu' stretto del trattamento svolto.
//
// I testi vivono in questo file e vengono renderizzati direttamente dai form:
// la formulazione mostrata all'utente e quella archiviata come prova devono
// coincidere (art. 7 par. 1 GDPR), e duplicarle nel JSX le farebbe divergere.
// ============================================================================

// DICHIARAZIONE DI CONSENSO: e' l'atto di volonta', accanto alla casella.
export const NEWSLETTER_CONSENT_TEXT =
  "Acconsento a ricevere la newsletter di Fuxture, che include comunicazioni " +
  "promozionali di inserzionisti terzi, e alla misurazione delle aperture " +
  "tramite pixel di tracciamento nostri e di tali inserzionisti, " +
  "disattivabile in qualsiasi momento dall'area preferenze.";

// INFORMATIVA SINTETICA: e' un atto distinto dal consenso e sta sotto la
// casella, non dentro la frase di consenso. L'EDPB segnala come punto debole
// l'impacchettamento della presa visione dentro la dichiarazione di volonta'.
// Il primo livello dell'informativa e' qui, quello esteso nella Privacy Policy
// (Linee Guida par. 4, informativa su piu' livelli).
export const NEWSLETTER_CONSENT_NOTICE =
  "Le comunicazioni promozionali possono riguardare i settori credito e " +
  "finanza, energia, assicurazioni, automotive, casa e ristrutturazioni, " +
  "largo consumo, formazione e viaggi. Il consenso è revocabile in ogni " +
  "momento.";

// RIMANDO ALL'INFORMATIVA ESTESA: e' il testo del link, tenuto qui perche'
// rientra in cio' che l'utente ha letto e quindi nella prova archiviata.
export const NEWSLETTER_PRIVACY_LINK_TEXT =
  "Informativa completa nella Privacy Policy";

// TESTO ARCHIVIATO COME PROVA: tutto cio' che l'utente ha letto accanto alla
// casella al momento dell'iscrizione, non la sola frase di consenso.
export const NEWSLETTER_CONSENT_RECORD = `${NEWSLETTER_CONSENT_TEXT} ${NEWSLETTER_CONSENT_NOTICE} ${NEWSLETTER_PRIVACY_LINK_TEXT}.`;

// ============================================================================
// CONSENSO COOKIE
//
// La scelta espressa nel banner viene archiviata in localStorage ma non era
// letta da nessuno: "Solo necessari" si limitava a nascondere il banner. Nel
// frattempo i componenti Adsterra caricavano gli script pubblicitari appena
// montati, senza chiedere niente a nessuno - e il banner dichiara
// testualmente che il sito "non installa cookie di profilazione o di terze
// parti".
//
// Oggi quei componenti non sono montati da nessuna parte, quindi la
// dichiarazione e' vera. Questa funzione esiste perche' resti vera anche il
// giorno in cui verranno riattivati: e' il gancio che i componenti di terze
// parti devono interrogare prima di caricare qualunque cosa.
// ============================================================================
export const COOKIE_CONSENT_KEY = "cookieConsent";

export type CookieConsent = "all" | "necessary" | null;

export const readCookieConsent = (): CookieConsent => {
  try {
    const value = localStorage.getItem(COOKIE_CONSENT_KEY);
    return value === "all" || value === "necessary" ? value : null;
  } catch {
    // Modalita' privata o storage bloccato: si assume il consenso non dato.
    return null;
  }
};

// Vale solo il consenso esplicito: chi non ha ancora scelto, o ha scelto i
// soli cookie tecnici, non va profilato.
export const hasMarketingConsent = (): boolean => readCookieConsent() === "all";
