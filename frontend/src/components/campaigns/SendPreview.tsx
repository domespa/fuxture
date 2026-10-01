import { useEffect, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import toast from "react-hot-toast";
import {
  Code,
  Download,
  Eye,
  History,
  Loader2,
  RotateCcw,
  X,
} from "lucide-react";
import {
  campaignsAPI,
  addressBookAPI,
  emailLogsAPI,
} from "@/services/api";
import type { Contact, ManualSend } from "@/types/mailing.types";
import {
  ricavaSuggerimenti,
  type SuggerimentiCreativita,
} from "@/lib/creativeSuggestions";

export const SendPreview = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"html" | "preview" | "recent">(
    "html",
  );

  // Rubrica per il completamento del destinatario. Se la chiamata fallisce
  // resta un campo di testo normale: e' una comodita', non un requisito.
  const [contacts, setContacts] = useState<Contact[]>([]);
  // Della versione web si digita solo il nome del file: prefisso ed estensione
  // sono sempre gli stessi, riscriverli ogni volta e' solo occasione di errori.
  const [creativeName, setCreativeName] = useState("");
  const [lancioSu, setLancioSu] = useState("");
  const [importingCreative, setImportingCreative] = useState(false);
  const [suggerimenti, setSuggerimenti] = useState<SuggerimentiCreativita>({
    mittenti: [],
    oggetti: [],
  });
  const [recentSends, setRecentSends] = useState<ManualSend[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [resumingId, setResumingId] = useState<string | null>(null);

  useEffect(() => {
    addressBookAPI
      .getContacts({ limit: 50 })
      .then(setContacts)
      .catch(() => setContacts([]));
  }, []);

  // L'elenco si carica quando si apre la tab, non all'apertura della pagina:
  // chi scrive una comunicazione nuova non deve pagarne il costo.
  useEffect(() => {
    if (activeTab !== "recent" || recentSends.length > 0) return;

    setLoadingRecent(true);
    emailLogsAPI
      .getManualSends(15)
      .then(setRecentSends)
      .catch(() => toast.error("Errore nel caricamento degli invii recenti"))
      .finally(() => setLoadingRecent(false));
  }, [activeTab, recentSends.length]);

  // Riprende un invio precedente: oggetto e corpo tornano nell'editor, il
  // destinatario resta da scegliere, perche' di norma si inoltra a qualcun altro.
  const resumeSend = async (id: string) => {
    try {
      setResumingId(id);
      const log = await emailLogsAPI.getById(id);

      if (!log.content) {
        toast.error("Di questo invio non è stato conservato il contenuto");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        subject: log.subject ?? prev.subject,
        content: log.content as string,
      }));
      setCreativeName("");
      setLancioSu("");
      // Verrebbero da un'altra creatività: tenerli sarebbe fuorviante.
      setSuggerimenti({ mittenti: [], oggetti: [] });
      setActiveTab("html");
      toast.success("Contenuto ripreso: controlla destinatario e oggetto");
    } catch {
      toast.error("Errore nel recupero dell'invio");
    } finally {
      setResumingId(null);
    }
  };

  // Destinatari confermati (i chip) e quello che si sta ancora scrivendo.
  const [recipients, setRecipients] = useState<string[]>([]);
  const [recipientDraft, setRecipientDraft] = useState("");

  // Separatori accettati: virgola, punto e virgola, spazi e a capo, cosi'
  // si puo' incollare una lista copiata da un'email o da un foglio.
  const RECIPIENT_SEPARATOR = /[,;\s]+/;
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const MAX_RECIPIENTS = 20;

  const addRecipients = (raw: string) => {
    const nuovi = raw
      .split(RECIPIENT_SEPARATOR)
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);

    if (nuovi.length === 0) return;

    const validi = nuovi.filter((email) => EMAIL_PATTERN.test(email));
    const scartati = nuovi.filter((email) => !EMAIL_PATTERN.test(email));

    if (scartati.length > 0) {
      toast.error(`Indirizzo non valido: ${scartati.join(", ")}`);
    }

    setRecipients((prev) => {
      const uniti = Array.from(new Set([...prev, ...validi]));
      if (uniti.length > MAX_RECIPIENTS) {
        toast.error(`Massimo ${MAX_RECIPIENTS} destinatari per invio`);
        return uniti.slice(0, MAX_RECIPIENTS);
      }
      return uniti;
    });

    // Gli scartati restano nel campo, da correggere invece che da riscrivere.
    setRecipientDraft(scartati.join(" "));
  };

  const removeRecipient = (email: string) =>
    setRecipients((prev) => prev.filter((r) => r !== email));

  const toggleRecipient = (email: string) => {
    const clean = email.toLowerCase();
    if (recipients.includes(clean)) {
      removeRecipient(clean);
    } else {
      addRecipients(clean);
    }
  };

  const handleRecipientKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === ";" || e.key === " ") {
      e.preventDefault();
      addRecipients(recipientDraft);
    } else if (
      e.key === "Backspace" &&
      recipientDraft === "" &&
      recipients.length > 0
    ) {
      removeRecipient(recipients[recipients.length - 1]);
    }
  };

  const handleRecipientChange = (value: string) => {
    // Incollando una lista, o scegliendo dal datalist dopo un separatore,
    // il testo contiene gia' piu' indirizzi: li confermiamo subito.
    if (RECIPIENT_SEPARATOR.test(value)) {
      addRecipients(value);
    } else {
      setRecipientDraft(value);
    }
  };

  const [formData, setFormData] = useState({
    fromName: "Fuxture",
    subject: "",
    content: `<p style="text-align: center;">Se non visualizzi correttamente questo messaggio <a href="{{web_version_url}}" target="_blank">guarda la versione web</a></p>

<hr>

<p style="text-align: center;">Questa email ti è stata inviata dal titolare del trattamento Spampinato Domenico, Carlentini 96013 P.IVA IT01937400891 <a href="mailto:info@fuxture.net">info@fuxture.net</a> perchè hai partecipato ad una delle nostre iniziative o perchè sei iscritto a Fuxture.<br>
Questo messaggio contiene pixel di tracciamento: immagini di dimensioni minime, ospitate su server esterni, che segnalano a noi e ai nostri inserzionisti l'avvenuta apertura. Puoi disattivarli continuando a ricevere le nostre comunicazioni dall'<a href="{{preferences_url}}">area preferenze</a>.<br>
Il messaggio è stato inviato alla tua email in ottemperanza al GDPR Reg. UE 679/06. Per cancellarti, clicca sul seguente <a href="https://www.fuxture.net/unsubscribe">link</a>. Puoi prendere visione dell'informativa privacy cliccando <a href="https://fuxture.net/privacy-policy/">qui</a>.<br><p>Lancio su</p>
<p>Per esito e modifiche PW scrivere a <a href="mailto:dumiii1988@gmail.com">Dumiii1988@gmail.com</a></p></p>`,
  });

  // Il link "guarda la versione web" nel footer: l'input lo riscrive
  // direttamente nell'HTML, cosi' quello che si vede nell'editor e' anche
  // quello che parte. Svuotando il campo torna il segnaposto, che il backend
  // sostituisce con l'indirizzo di anteprima.
  const WEB_VERSION_ANCHOR =
    /(<a\s+href=")([^"]*)("[^>]*>\s*guarda la versione web\s*<\/a>)/i;

  const applyWebVersionUrl = (html: string, url: string): string =>
    html.replace(
      WEB_VERSION_ANCHOR,
      (_match, before: string, _old: string, after: string) =>
        `${before}${url.trim() || "{{web_version_url}}"}${after}`,
    );

  const NEWSLETTER_BASE = "https://www.fuxture.net/newsletter/";
  const NEWSLETTER_EXT = ".html";

  // Se per abitudine si incolla l'indirizzo intero, o si aggiunge .html,
  // riduciamo al solo nome invece di comporre un URL doppio.
  const normalizeCreativeName = (raw: string): string =>
    raw
      .trim()
      .replace(/^https?:\/\/(www\.)?fuxture\.net\/newsletter\//i, "")
      .replace(/\.html?$/i, "")
      .replace(/^\/+|\/+$/g, "");

  // Il campo mostra quello che si digita; l'URL lo ricaviamo a parte, cosi la
  // normalizzazione non combatte con chi sta ancora scrivendo.
  const normalizedName = normalizeCreativeName(creativeName);
  const webVersionUrl = normalizedName
    ? `${NEWSLETTER_BASE}${normalizedName}${NEWSLETTER_EXT}`
    : "";

  const handleCreativeNameChange = (raw: string) => {
    setCreativeName(raw);
    const name = normalizeCreativeName(raw);
    const url = name ? `${NEWSLETTER_BASE}${name}${NEWSLETTER_EXT}` : "";
    setFormData((prev) => ({
      ...prev,
      content: applyWebVersionUrl(prev.content, url),
    }));
  };

  // La riga "Lancio su" nel piede legale: si compila da qui invece di andarla
  // a cercare a mano dentro l'HTML.
  const LANCIO_ANCHOR = /(<p>\s*Lancio su)([^<]*)(<\/p>)/i;

  const applyLancioSu = (html: string, value: string): string =>
    html.replace(
      LANCIO_ANCHOR,
      (_match, before: string, _old: string, after: string) => {
        const testo = value.trim();
        return `${before}${testo ? ` ${testo}` : ""}${after}`;
      },
    );

  const handleLancioChange = (value: string) => {
    setLancioSu(value);
    setFormData((prev) => ({
      ...prev,
      content: applyLancioSu(prev.content, value),
    }));
  };

  // Del file preso dal sito serve il corpo: infilare <html> e <head> dentro
  // l'email produce markup annidato che i client di posta scartano.
  const extractBody = (html: string): string => {
    const match = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    return (match ? match[1] : html).trim();
  };

  // I marcatori delimitano la creativita dentro il corpo dell'email: servono a
  // reimportare sostituendo, invece di accodare una copia a ogni clic.
  const CREATIVE_BLOCK =
    /<!-- creativita:inizio -->[\s\S]*?<!-- creativita:fine -->/i;

  // La creativita entra fra l'intestazione "guarda la versione web" e l'<hr>
  // che apre il piede legale, cosi i due paragrafi fissi restano dove sono.
  const applyCreativeHtml = (current: string, creative: string): string => {
    const block = `<!-- creativita:inizio -->\n${creative}\n<!-- creativita:fine -->`;

    if (CREATIVE_BLOCK.test(current)) {
      return current.replace(CREATIVE_BLOCK, block);
    }

    const hr = current.search(/<hr\s*\/?>/i);
    if (hr === -1) return `${current}\n\n${block}`;

    return `${current.slice(0, hr)}${block}\n\n${current.slice(hr)}`;
  };

  const importCreative = async () => {
    if (!normalizedName) {
      toast.error("Inserisci il nome della creatività");
      return;
    }

    // Le creatività sono file statici del frontend (public/newsletter/): in
    // produzione le serve Vercel sullo stesso dominio del pannello, in sviluppo
    // le serve Vite dalla cartella locale. Chiedendole con un percorso relativo
    // la richiesta resta same-origin e parte dal browser: niente CORS, e niente
    // filtro anti-bot di Cloudflare, che invece risponde 403 alle chiamate
    // server-to-server in uscita da Render.
    const percorso = `/newsletter/${normalizedName}${NEWSLETTER_EXT}`;

    try {
      setImportingCreative(true);
      const risposta = await fetch(percorso);

      if (risposta.status === 404) {
        toast.error(
          `Creatività non trovata: ${normalizedName}${NEWSLETTER_EXT}`,
        );
        return;
      }

      if (!risposta.ok) {
        toast.error(`Il server ha risposto ${risposta.status} per ${percorso}`);
        return;
      }

      const scaricato = await risposta.text();

      // Se un domani le rotte sconosciute venissero rimandate all'app,
      // riceveremmo la pagina del pannello al posto della creatività.
      if (scaricato.includes('id="root"')) {
        toast.error(
          `Creatività non trovata: ${normalizedName}${NEWSLETTER_EXT}`,
        );
        return;
      }

      const body = extractBody(scaricato);

      if (!body) {
        toast.error("La creatività è vuota");
        return;
      }

      // Sul file intero, non sul solo corpo: il <title> sta nell'head.
      setSuggerimenti(ricavaSuggerimenti(scaricato));

      // Reinseriamo anche link e lancio: il blocco appena importato non li ha.
      setFormData((prev) => ({
        ...prev,
        content: applyLancioSu(
          applyWebVersionUrl(
            applyCreativeHtml(prev.content, body),
            webVersionUrl,
          ),
          lancioSu,
        ),
      }));
      toast.success("HTML della creatività importato");
    } catch {
      toast.error("Impossibile leggere la creatività");
    } finally {
      setImportingCreative(false);
    }
  };

  const validateForm = (toEmails: string[]): boolean => {
    if (!formData.subject || formData.subject.trim().length < 3) {
      toast.error("L'oggetto deve contenere almeno 3 caratteri");
      return false;
    }

    if (recipientDraft.trim() && !EMAIL_PATTERN.test(recipientDraft.trim())) {
      toast.error(`Indirizzo non valido: ${recipientDraft.trim()}`);
      return false;
    }

    if (toEmails.length === 0) {
      toast.error("Inserisci almeno un destinatario");
      return false;
    }

    if (toEmails.length > MAX_RECIPIENTS) {
      toast.error(`Massimo ${MAX_RECIPIENTS} destinatari per invio`);
      return false;
    }

    if (!formData.content || formData.content.trim().length === 0) {
      toast.error("Il contenuto non può essere vuoto");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    // Un indirizzo scritto ma non ancora confermato con Invio conta lo
    // stesso: chi preme "Invia" si aspetta che parta anche quello.
    const draft = recipientDraft.trim().toLowerCase();
    const toEmails = Array.from(
      new Set(draft ? [...recipients, draft] : recipients),
    );

    if (!validateForm(toEmails)) return;

    setIsSubmitting(true);

    try {
      const { sent, failed } = await campaignsAPI.sendPreviewEmail({
        toEmails,
        subject: formData.subject,
        content: formData.content,
        fromName: formData.fromName,
      });

      if (failed.length > 0) {
        // Restano in pagina solo quelli da riprovare.
        setRecipients(failed.map((f) => f.email));
        setRecipientDraft("");
        toast.error(
          `Inviata a ${sent.length}, non riuscita per: ${failed
            .map((f) => f.email)
            .join(", ")}`,
          { duration: 8000 },
        );
        return;
      }

      toast.success(
        sent.length === 1
          ? `Email inviata con successo a ${sent[0]}!`
          : `Email inviata con successo a ${sent.length} destinatari!`,
      );
      navigate("/dashboard/campaigns");
    } catch (error) {
      console.error("Errore invio preview:", error);
      toast.error("Errore durante l'invio dell'email");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard/campaigns");
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Invia Email per Approvazione
        </h1>
        <p className="text-muted-foreground">
          Invia una preview della campagna all'affiliazione per ottenere
          l'approvazione
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6 max-w-4xl">
        {/* From Name */}
        <div className="space-y-2">
          <Label htmlFor="fromName">Nome mittente</Label>
          <Input
            id="fromName"
            type="text"
            placeholder="Fuxture"
            value={formData.fromName}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, fromName: e.target.value }))
            }
            disabled={isSubmitting}
          />
          {suggerimenti.mittenti.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-muted-foreground">
                Dalla creatività:
              </span>
              {suggerimenti.mittenti.map((voce) => (
                <button
                  key={voce}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, fromName: voce }))
                  }
                  disabled={isSubmitting}
                  className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-700 transition-colors hover:border-indigo-400 hover:text-indigo-700"
                >
                  {voce}
                </button>
              ))}
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Se vuoto, verrà usato "Fuxture"
          </p>
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <Label htmlFor="subject">
            Oggetto <span className="text-red-500">*</span>
          </Label>
          <Input
            id="subject"
            type="text"
            placeholder="Es: Newsletter di Gennaio 2025"
            value={formData.subject}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, subject: e.target.value }))
            }
            maxLength={200}
            disabled={isSubmitting}
          />
          {suggerimenti.oggetti.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-muted-foreground">
                Dalla creatività:
              </span>
              {suggerimenti.oggetti.map((voce) => (
                <button
                  key={voce}
                  type="button"
                  title={voce}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, subject: voce }))
                  }
                  disabled={isSubmitting}
                  className="max-w-[22rem] truncate rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-700 transition-colors hover:border-indigo-400 hover:text-indigo-700"
                >
                  {voce}
                </button>
              ))}
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            {formData.subject.length}/200 caratteri
          </p>
        </div>

        {/* Destinatario */}
        <div className="space-y-2">
          <Label htmlFor="toEmail">
            Destinatari (Email Affiliazione){" "}
            <span className="text-red-500">*</span>
          </Label>
          <div className="flex min-h-10 flex-wrap items-center gap-2 rounded-md border border-input bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
            {recipients.map((email) => (
              <span
                key={email}
                className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-800"
              >
                {email}
                <button
                  type="button"
                  onClick={() => removeRecipient(email)}
                  disabled={isSubmitting}
                  aria-label={`Rimuovi ${email}`}
                  className="text-indigo-400 hover:text-indigo-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              id="toEmail"
              type="text"
              list="address-book"
              placeholder={
                recipients.length === 0 ? "affiliazione@example.com" : ""
              }
              value={recipientDraft}
              onChange={(e) => handleRecipientChange(e.target.value)}
              onKeyDown={handleRecipientKeyDown}
              onBlur={() => addRecipients(recipientDraft)}
              disabled={isSubmitting}
              className="min-w-[12rem] flex-1 bg-transparent text-sm focus:outline-none disabled:opacity-50"
            />
          </div>
          <datalist id="address-book">
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.email}>
                {contact.name ?? ""}
              </option>
            ))}
          </datalist>
          {/* Il datalist da solo non si vede: i destinatari recenti vanno
              mostrati, altrimenti la rubrica esiste ma non la trova nessuno. */}
          {contacts.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-muted-foreground">Recenti:</span>
              {contacts.slice(0, 6).map((contact) => {
                const selected = recipients.includes(
                  contact.email.toLowerCase(),
                );
                return (
                  <button
                    key={contact.id}
                    type="button"
                    title={contact.email}
                    onClick={() => toggleRecipient(contact.email)}
                    disabled={isSubmitting}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      selected
                        ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 text-gray-700 hover:border-indigo-400 hover:text-indigo-700"
                    }`}
                  >
                    {contact.name ?? contact.email}
                  </button>
                );
              })}
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Premi Invio o virgola per aggiungere un indirizzo, oppure incolla una
            lista. Ognuno riceve un'email separata e non vede gli altri
            destinatari (max {MAX_RECIPIENTS}).
          </p>
        </div>

        {/* VERSIONE WEB */}
        <div className="space-y-2">
          <Label htmlFor="creativeName">Versione web</Label>
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring">
              <span className="hidden whitespace-nowrap pl-3 text-sm text-muted-foreground sm:inline">
                {NEWSLETTER_BASE}
              </span>
              <input
                id="creativeName"
                type="text"
                placeholder="NomeCreativita"
                value={creativeName}
                onChange={(e) => handleCreativeNameChange(e.target.value)}
                disabled={isSubmitting}
                className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm focus:outline-none disabled:opacity-50"
              />
              <span className="hidden pr-3 text-sm text-muted-foreground sm:inline">
                {NEWSLETTER_EXT}
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={importCreative}
              disabled={isSubmitting || importingCreative || !normalizedName}
            >
              {importingCreative ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Importa HTML
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {normalizedName ? (
              <>
                Link nel footer:{" "}
                <span className="font-mono">{webVersionUrl}</span>
              </>
            ) : (
              "Scrivi solo il nome del file: prefisso ed estensione li aggiunge da sé."
            )}
          </p>
        </div>

        {/* LANCIO SU */}
        <div className="space-y-2">
          <Label htmlFor="lancioSu">Lancio su</Label>
          <Input
            id="lancioSu"
            type="text"
            placeholder="Es: Database Fuxture"
            value={lancioSu}
            onChange={(e) => handleLancioChange(e.target.value)}
            disabled={isSubmitting}
          />
          <p className="text-sm text-muted-foreground">
            Compila la riga "Lancio su" nel piede legale. Vuoto, resta la sola
            dicitura.
          </p>
        </div>

        {/* Content: HTML + Anteprima */}
        <div className="space-y-2">
          <Label>
            Contenuto <span className="text-red-500">*</span>
          </Label>

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "html" | "preview")}
          >
            <TabsList>
              <TabsTrigger value="html">
                <Code className="h-4 w-4 mr-2" />
                HTML
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4 mr-2" />
                Anteprima
              </TabsTrigger>
              <TabsTrigger value="recent">
                <History className="h-4 w-4 mr-2" />
                Ultime inviate
              </TabsTrigger>
            </TabsList>

            {/* Tab HTML */}
            <TabsContent value="html" className="border rounded-lg bg-white">
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, content: e.target.value }))
                }
                className="w-full h-[500px] p-4 font-mono text-sm border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg resize-none"
                placeholder="Incolla qui il tuo HTML completo..."
                disabled={isSubmitting}
              />
            </TabsContent>

            {/* Tab Anteprima */}
            <TabsContent
              value="preview"
              className="border rounded-lg bg-white overflow-hidden"
            >
              <div className="w-full h-[600px]">
                <iframe
                  srcDoc={formData.content}
                  className="w-full h-full border-0"
                  title="Email Preview"
                  sandbox="allow-same-origin allow-popups"
                />
              </div>
            </TabsContent>

            {/* Tab ULTIME INVIATE */}
            <TabsContent value="recent" className="border rounded-lg bg-white">
              {loadingRecent ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : recentSends.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <History className="mx-auto mb-3 h-8 w-8 text-gray-300" />
                  <p className="text-sm text-gray-500">
                    Nessun invio manuale ancora. Le comunicazioni inviate da
                    questa schermata compariranno qui, pronte da riprendere.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {recentSends.map((send) => (
                    <li
                      key={send.id}
                      className="flex items-center gap-4 px-5 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-gray-900">
                          {send.subject || "(senza oggetto)"}
                        </span>
                        <span className="block truncate text-xs text-gray-500">
                          {send.recipientEmail ?? "destinatario non registrato"}
                          {" · "}
                          {new Date(send.sentAt).toLocaleString("it-IT", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {send.status === "FAILED" && (
                            <span className="ml-2 font-semibold text-red-600">
                              non riuscito
                            </span>
                          )}
                        </span>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resumeSend(send.id)}
                        disabled={resumingId === send.id}
                      >
                        {resumingId === send.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <RotateCcw className="mr-2 h-4 w-4" />
                        )}
                        Riprendi
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? "Invio in corso..." : "Invia Email"}
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Annulla
          </Button>
        </div>
      </div>
    </div>
  );
};
