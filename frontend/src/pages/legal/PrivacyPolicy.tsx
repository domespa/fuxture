import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Cookie,
  Shield,
  Mail,
  Lock,
  Eye,
  Trash2,
  FileText,
  AlertCircle,
} from "lucide-react";

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-600">
            Ultimo aggiornamento: <strong>01/09/2026</strong>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Conforme al Regolamento UE 2016/679 (GDPR)
          </p>
        </div>

        {/* Alert Box */}
        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">I Tuoi Diritti</h3>
              <p className="text-blue-800 text-sm">
                Hai il diritto di accedere, rettificare, cancellare i tuoi dati
                personali e opporti al loro trattamento. Per esercitare questi
                diritti, contattaci all'indirizzo email indicato in fondo a
                questa pagina.
              </p>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-gray-100 p-6 rounded-lg mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Indice dei Contenuti
          </h2>
          <ul className="space-y-2 text-blue-600">
            <li>
              <a href="#titolare" className="hover:underline">
                1. Titolare del Trattamento
              </a>
            </li>
            <li>
              <a href="#dati-raccolti" className="hover:underline">
                2. Dati Raccolti
              </a>
            </li>
            <li>
              <a href="#finalita" className="hover:underline">
                3. Finalità del Trattamento
              </a>
            </li>
            <li>
              <a href="#base-giuridica" className="hover:underline">
                4. Base Giuridica
              </a>
            </li>
            <li>
              <a href="#conservazione" className="hover:underline">
                5. Periodo di Conservazione
              </a>
            </li>
            <li>
              <a href="#comunicazione" className="hover:underline">
                6. Comunicazione e Diffusione
              </a>
            </li>
            <li>
              <a href="#diritti" className="hover:underline">
                7. Diritti dell'Interessato
              </a>
            </li>
            <li>
              <a href="#sicurezza" className="hover:underline">
                8. Sicurezza dei Dati
              </a>
            </li>
            <li>
              <a href="#cookie" className="hover:underline">
                9. Cookie e Tecnologie di Tracciamento
              </a>
            </li>
            <li>
              <a href="#modifiche" className="hover:underline">
                10. Modifiche alla Privacy Policy
              </a>
            </li>
            <li>
              <a href="#contatti" className="hover:underline">
                11. Contatti
              </a>
            </li>
          </ul>
        </div>

        {/* Content Sections */}
        <div className="prose prose-blue max-w-none">
          {/* 1. Titolare del Trattamento */}
          <section id="titolare" className="mb-10 scroll-mt-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-7 h-7 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 m-0">
                1. Titolare del Trattamento
              </h2>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-700 mb-3">
                <strong>Nome e Cognome:</strong> Domenico Spampinato
              </p>
              <p className="text-gray-700 mb-3">
                <strong>Partita IVA:</strong> IT01937400891
              </p>
              <p className="text-gray-700 mb-3">
                <strong>Regime fiscale:</strong> Forfettario
              </p>
              <p className="text-gray-700 mb-3">
                <strong>Località:</strong> Carlentini, Italia
              </p>
              <p className="text-gray-700 mb-0">
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:info@fuxture.net"
                  className="text-blue-600 hover:underline"
                >
                  info@fuxture.net
                </a>
              </p>
            </div>
          </section>

          {/* 2. Dati Raccolti */}
          <section id="dati-raccolti" className="mb-10 scroll-mt-6">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-7 h-7 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 m-0">
                2. Dati Raccolti
              </h2>
            </div>
            <p className="text-gray-700 mb-4">
              Questo sito raccoglie e tratta le seguenti categorie di dati
              personali:
            </p>

            <div className="space-y-6">
              {/* Newsletter */}
              <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-600">
                <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  Newsletter
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>
                    <strong>Email</strong> (obbligatorio): per invio newsletter
                  </li>
                  <li>
                    <strong>Nome</strong> (facoltativo): per personalizzazione
                    comunicazioni
                  </li>
                  <li>
                    <strong>Data iscrizione</strong>: timestamp registrazione
                  </li>
                  <li>
                    <strong>Status</strong>: stato iscrizione
                    (attivo/cancellato/bounced)
                  </li>
                  <li>
                    <strong>Source</strong>: origine iscrizione (es. "homepage",
                    "articolo")
                  </li>
                  <li>
                    <strong>Metadata</strong>: eventuali preferenze utente
                  </li>
                  <li>
                    <strong>Liste di iscrizione</strong>: elenco/i tematici a
                    cui l'indirizzo è associato
                  </li>
                  <li>
                    <strong>Log di invio</strong>: esito tecnico dell'invio
                    (inviata, non consegnata/bounce, errore) e relativa data
                  </li>
                </ul>
                <p className="text-sm text-gray-600 mt-3 italic">
                  ℹ️ Non utilizziamo pixel di tracciamento né link tracciati:
                  non rileviamo se apri le email o su quali link clicchi.
                </p>
              </div>

              {/* Commenti */}
              <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-600">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Commenti agli Articoli
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>
                    <strong>Nome</strong>: nome pubblico visualizzato
                  </li>
                  <li>
                    <strong>Email</strong>: per notifiche e moderazione (non
                    pubblico)
                  </li>
                  <li>
                    <strong>Contenuto commento</strong>: testo pubblico
                  </li>
                  <li>
                    <strong>Data e ora</strong>: timestamp commento
                  </li>
                  <li>
                    <strong>Stato di moderazione</strong>: in attesa,
                    approvato, rifiutato o contrassegnato come spam
                  </li>
                </ul>
                <p className="text-sm text-gray-600 mt-3 italic">
                  ℹ️ Non associamo l'indirizzo IP ai commenti: la moderazione è
                  manuale e avviene sul solo contenuto pubblicato.
                </p>
              </div>

              {/* Form Contatto */}
              <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-600">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Form di Contatto
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>
                    <strong>Nome</strong>: identificazione mittente
                  </li>
                  <li>
                    <strong>Email</strong>: per risposta
                  </li>
                  <li>
                    <strong>Oggetto</strong>: categoria richiesta
                  </li>
                  <li>
                    <strong>Messaggio</strong>: contenuto comunicazione
                  </li>
                </ul>
                <p className="text-sm text-gray-600 mt-3 italic">
                  ℹ️ I messaggi inviati dal form <strong>non</strong> vengono
                  archiviati nel database del sito: sono inoltrati via email
                  alla casella del titolare (con copia di conferma al mittente)
                  e cancellati dopo la gestione della richiesta (max 90 giorni).
                </p>
              </div>

              {/* Account Area Riservata */}
              <div className="bg-indigo-50 p-6 rounded-lg border-l-4 border-indigo-600">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Account dell'Area Riservata
                </h3>
                <p className="text-gray-700 mb-3">
                  L'area riservata è destinata esclusivamente al titolare e agli
                  eventuali collaboratori autorizzati alla redazione dei
                  contenuti. La registrazione non è aperta al pubblico. Per
                  questi account trattiamo:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>
                    <strong>Nome e cognome</strong>: attribuzione degli articoli
                  </li>
                  <li>
                    <strong>Email</strong>: credenziale di accesso e contatto
                  </li>
                  <li>
                    <strong>Password</strong>: conservata esclusivamente come
                    hash cifrato (bcrypt), mai in chiaro
                  </li>
                  <li>
                    <strong>Ruolo</strong>: livello di autorizzazione
                    (amministratore, redattore)
                  </li>
                  <li>
                    <strong>Accettazione dei termini</strong>: data e ora del
                    consenso ai Termini di Servizio
                  </li>
                </ul>
              </div>

              {/* Dati di Navigazione */}
              <div className="bg-gray-100 p-6 rounded-lg border-l-4 border-gray-600">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Dati di Navigazione (Log)
                </h3>
                <p className="text-gray-700 mb-3">
                  I sistemi informatici e le procedure software preposte al
                  funzionamento di questo sito raccolgono, nel corso del loro
                  normale esercizio, alcuni dati personali la cui trasmissione è
                  implicita nell'uso dei protocolli di comunicazione Internet:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Indirizzo IP</li>
                  <li>Browser e sistema operativo</li>
                  <li>Pagine visitate e tempo di permanenza</li>
                  <li>Riferimento (referer) di provenienza</li>
                </ul>
                <p className="text-sm text-gray-600 mt-3 italic">
                  ℹ️ Questi dati sono utilizzati al solo fine di ricavare
                  informazioni statistiche anonime sull'uso del sito.
                </p>
              </div>
            </div>
          </section>

          {/* 3. Finalità del Trattamento */}
          <section id="finalita" className="mb-10 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. Finalità del Trattamento
            </h2>
            <p className="text-gray-700 mb-4">
              I tuoi dati personali sono trattati per le seguenti finalità:
            </p>
            <div className="space-y-4">
              <div className="flex gap-3">
                <span className="text-blue-600 font-bold flex-shrink-0">
                  a)
                </span>
                <div>
                  <strong className="text-gray-900">Invio Newsletter</strong>
                  <p className="text-gray-700 mt-1">
                    Invio di comunicazioni periodiche relative a nuovi articoli,
                    contenuti esclusivi e aggiornamenti del blog. Puoi
                    disiscriverti in qualsiasi momento cliccando sul link in
                    fondo a ogni email.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-blue-600 font-bold flex-shrink-0">
                  b)
                </span>
                <div>
                  <strong className="text-gray-900">Gestione Commenti</strong>
                  <p className="text-gray-700 mt-1">
                    Pubblicazione e moderazione dei commenti lasciati dagli
                    utenti sugli articoli del blog. L'email non sarà mai resa
                    pubblica e servirà solo per eventuali comunicazioni relative
                    al commento.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-blue-600 font-bold flex-shrink-0">
                  c)
                </span>
                <div>
                  <strong className="text-gray-900">
                    Risposta a Richieste
                  </strong>
                  <p className="text-gray-700 mt-1">
                    Gestione delle richieste inviate tramite il form di
                    contatto. I dati saranno utilizzati esclusivamente per
                    rispondere alla tua richiesta.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-blue-600 font-bold flex-shrink-0">
                  d)
                </span>
                <div>
                  <strong className="text-gray-900">
                    Sicurezza e Prevenzione Abusi
                  </strong>
                  <p className="text-gray-700 mt-1">
                    Prevenzione di spam, attività fraudolente e violazioni dei
                    termini di servizio, attraverso la moderazione manuale dei
                    commenti e i log tecnici dei server.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-blue-600 font-bold flex-shrink-0">
                  e)
                </span>
                <div>
                  <strong className="text-gray-900">
                    Analisi Statistiche Anonime
                  </strong>
                  <p className="text-gray-700 mt-1">
                    Miglioramento del sito attraverso analisi aggregate e
                    anonimizzate dei dati di navigazione (senza identificazione
                    personale).
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-blue-600 font-bold flex-shrink-0">
                  f)
                </span>
                <div>
                  <strong className="text-gray-900">
                    Gestione dell'Area Riservata
                  </strong>
                  <p className="text-gray-700 mt-1">
                    Autenticazione e gestione degli account del titolare e dei
                    collaboratori autorizzati alla pubblicazione dei contenuti.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border-l-4 border-green-600 p-5 rounded-lg mt-6">
              <p className="text-gray-800 m-0">
                <strong>Nessuna profilazione.</strong> Non effettuiamo
                profilazione né processi decisionali automatizzati ai sensi
                dell'art. 22 GDPR, non tracciamo aperture e clic delle
                newsletter, non utilizziamo strumenti di analisi di terze parti
                (come Google Analytics) e non trattiamo categorie particolari di
                dati (art. 9 GDPR).
              </p>
            </div>
          </section>

          {/* 4. Base Giuridica */}
          <section id="base-giuridica" className="mb-10 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. Base Giuridica del Trattamento
            </h2>
            <p className="text-gray-700 mb-4">
              Il trattamento dei tuoi dati personali si basa sulle seguenti basi
              giuridiche previste dal GDPR:
            </p>
            <div className="space-y-4">
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2">
                  Consenso (Art. 6.1.a GDPR)
                </h3>
                <p className="text-gray-700">
                  Per l'iscrizione alla newsletter e l'invio di comunicazioni
                  promozionali. Il consenso può essere revocato in qualsiasi
                  momento attraverso il link di disiscrizione presente in ogni
                  email o contattandoci.
                </p>
              </div>

              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2">
                  Consenso (Art. 6.1.a GDPR) – Commenti e Form di Contatto
                </h3>
                <p className="text-gray-700">
                  Per la pubblicazione dei commenti e per la gestione delle
                  richieste inviate tramite il form di contatto: in entrambi i
                  casi sei tu a fornire spontaneamente i dati per ottenere la
                  pubblicazione del commento o una risposta, e puoi chiederne la
                  cancellazione in qualsiasi momento.
                </p>
              </div>

              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2">
                  Legittimo Interesse (Art. 6.1.f GDPR)
                </h3>
                <p className="text-gray-700">
                  Per la prevenzione di spam, frodi e violazioni della
                  sicurezza, nonché per analisi statistiche aggregate
                  finalizzate al miglioramento del servizio.
                </p>
              </div>

              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2">
                  Obbligo Legale (Art. 6.1.c GDPR)
                </h3>
                <p className="text-gray-700">
                  Per la conservazione della prova del consenso alla newsletter
                  e per l'adempimento di obblighi di legge o di richieste
                  provenienti dalle autorità competenti.
                </p>
              </div>
            </div>
          </section>

          {/* 5. Conservazione */}
          <section id="conservazione" className="mb-10 scroll-mt-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-7 h-7 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 m-0">
                5. Periodo di Conservazione dei Dati
              </h2>
            </div>
            <p className="text-gray-700 mb-4">
              I dati personali sono conservati per i seguenti periodi:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="border border-gray-300 px-4 py-3 text-left">
                      Categoria Dati
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left">
                      Periodo di Conservazione
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-4 py-3">
                      <strong>Newsletter</strong>
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      Fino alla revoca del consenso (disiscrizione) o richiesta
                      di cancellazione
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3">
                      <strong>Commenti</strong>
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      Indefinitamente (parte integrante del contenuto pubblico),
                      salvo richiesta di cancellazione
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-4 py-3">
                      <strong>Form Contatto</strong>
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      90 giorni dalla gestione della richiesta (i messaggi
                      restano nella sola casella di posta del titolare, non nel
                      database del sito)
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3">
                      <strong>Log di Navigazione</strong>
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      7-30 giorni (solo per finalità di sicurezza)
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 px-4 py-3">
                      <strong>Log di Invio Newsletter</strong>
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      24 mesi dall'invio, o comunque fino alla cancellazione
                      dell'iscrizione a cui si riferiscono
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3">
                      <strong>Account Area Riservata</strong>
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      Per tutta la durata dell'account, cancellati entro 30
                      giorni dalla sua chiusura
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 6. Comunicazione */}
          <section id="comunicazione" className="mb-10 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. Comunicazione e Diffusione dei Dati
            </h2>
            <p className="text-gray-700 mb-4">
              I tuoi dati personali possono essere comunicati a:
            </p>
            <div className="space-y-4">
              <div className="bg-yellow-50 p-5 rounded-lg border-l-4 border-yellow-500">
                <h3 className="font-bold text-gray-900 mb-2">
                  Provider di Hosting e Servizi Cloud
                </h3>
                <p className="text-gray-700 mb-3">
                  I dati sono ospitati su server gestiti da fornitori
                  professionali, nominati responsabili del trattamento ai sensi
                  dell'art. 28 GDPR:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>
                    <strong>Vercel</strong>: hosting del sito e distribuzione
                    delle pagine
                  </li>
                  <li>
                    <strong>Render</strong>: hosting dell'applicazione e del
                    database PostgreSQL, con server situati a{" "}
                    <strong>Francoforte (Germania, Unione Europea)</strong>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-5 rounded-lg border-l-4 border-yellow-500">
                <h3 className="font-bold text-gray-900 mb-2">
                  Invio delle Newsletter
                </h3>
                <p className="text-gray-700">
                  Gli indirizzi degli iscritti sono conservati nel nostro
                  database e <strong>non</strong> vengono caricati su
                  piattaforme di email marketing di terze parti. La consegna
                  materiale dei messaggi avviene tramite un provider SMTP
                  professionale, nominato responsabile del trattamento, che
                  tratta i dati esclusivamente per recapitare le comunicazioni
                  da te autorizzate.
                </p>
              </div>

              <div className="bg-yellow-50 p-5 rounded-lg border-l-4 border-yellow-500">
                <h3 className="font-bold text-gray-900 mb-2">
                  Autorità Competenti
                </h3>
                <p className="text-gray-700">
                  In caso di obblighi di legge, i dati potranno essere
                  comunicati alle autorità competenti (es. forze dell'ordine,
                  autorità giudiziarie).
                </p>
              </div>
            </div>
            <p className="text-gray-700 mt-4">
              <strong>I tuoi dati NON saranno:</strong>
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-2">
              <li>Venduti a terze parti</li>
              <li>Utilizzati per scopi diversi da quelli indicati</li>
              <li>
                Trasferiti fuori dall'Unione Europea senza adeguate garanzie
              </li>
            </ul>
          </section>

          {/* 7. Diritti dell'Interessato */}
          <section id="diritti" className="mb-10 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              7. I Tuoi Diritti (GDPR Art. 15-22)
            </h2>
            <p className="text-gray-700 mb-4">
              In qualità di interessato, hai diritto a:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Diritto di Accesso (Art. 15)
                </h3>
                <p className="text-gray-700 text-sm">
                  Ottenere conferma dell'esistenza di dati personali che ti
                  riguardano e riceverne copia.
                </p>
              </div>

              <div className="bg-green-50 p-5 rounded-lg border border-green-200">
                <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Diritto di Rettifica (Art. 16)
                </h3>
                <p className="text-gray-700 text-sm">
                  Correggere dati inesatti o integrare dati incompleti.
                </p>
              </div>

              <div className="bg-red-50 p-5 rounded-lg border border-red-200">
                <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Diritto alla Cancellazione (Art. 17)
                </h3>
                <p className="text-gray-700 text-sm">
                  Ottenere la cancellazione dei dati ("diritto all'oblio") nei
                  casi previsti dalla legge.
                </p>
              </div>

              <div className="bg-purple-50 p-5 rounded-lg border border-purple-200">
                <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Diritto di Limitazione (Art. 18)
                </h3>
                <p className="text-gray-700 text-sm">
                  Chiedere la limitazione del trattamento in casi specifici.
                </p>
              </div>

              <div className="bg-orange-50 p-5 rounded-lg border border-orange-200">
                <h3 className="font-bold text-orange-900 mb-2">
                  Diritto di Portabilità (Art. 20)
                </h3>
                <p className="text-gray-700 text-sm">
                  Ricevere i tuoi dati in formato strutturato e leggibile da
                  dispositivo automatico.
                </p>
              </div>

              <div className="bg-gray-100 p-5 rounded-lg border border-gray-300">
                <h3 className="font-bold text-gray-900 mb-2">
                  Diritto di Opposizione (Art. 21)
                </h3>
                <p className="text-gray-700 text-sm">
                  Opporti al trattamento per motivi legittimi, inclusa
                  l'opposizione al marketing diretto.
                </p>
              </div>
            </div>

            <div className="bg-blue-600 text-white p-6 rounded-lg mt-6">
              <h3 className="font-bold text-xl mb-3">
                Come Esercitare i Tuoi Diritti
              </h3>
              <p className="mb-4">
                Per esercitare uno qualsiasi dei diritti sopra elencati, puoi
                contattarci via email all'indirizzo:
              </p>
              <a
                href="mailto:info@fuxture.net"
                className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
              >
                📧 info@fuxture.net
              </a>
              <p className="text-sm mt-4 opacity-90">
                Ti risponderemo entro <strong>30 giorni</strong> dalla
                richiesta, come previsto dal GDPR. In caso di richieste
                complesse, il termine può essere esteso di ulteriori 60 giorni.
              </p>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 mt-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">
                Reclamo al Garante Privacy
              </h3>
              <p className="text-gray-700 mb-3">
                Hai inoltre il diritto di proporre reclamo all'Autorità di
                controllo competente (Garante per la Protezione dei Dati
                Personali) se ritieni che il trattamento dei tuoi dati violi il
                GDPR:
              </p>
              <p className="text-gray-700">
                <strong>Garante per la protezione dei dati personali</strong>
                <br />
                Piazza Venezia n. 11, 00187 - Roma
                <br />
                Tel: +39 06.696771
                <br />
                Email:{" "}
                <a
                  href="mailto:garante@gpdp.it"
                  className="text-blue-600 hover:underline"
                >
                  garante@gpdp.it
                </a>
                <br />
                Sito:{" "}
                <a
                  href="https://www.garanteprivacy.it"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  www.garanteprivacy.it
                </a>
              </p>
            </div>
          </section>

          {/* 8. Sicurezza */}
          <section id="sicurezza" className="mb-10 scroll-mt-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-7 h-7 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 m-0">
                8. Misure di Sicurezza
              </h2>
            </div>
            <p className="text-gray-700 mb-4">
              Adottiamo misure tecniche e organizzative adeguate per proteggere
              i tuoi dati personali da:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex gap-3 items-start">
                <span className="text-2xl">🔒</span>
                <div>
                  <strong className="text-gray-900">Crittografia</strong>
                  <p className="text-gray-700 text-sm mt-1">
                    Tutti i dati sensibili sono protetti tramite crittografia
                    (HTTPS/SSL).
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <span className="text-2xl">🛡️</span>
                <div>
                  <strong className="text-gray-900">Firewall e Backup</strong>
                  <p className="text-gray-700 text-sm mt-1">
                    Server protetti da firewall e backup regolari automatizzati.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <span className="text-2xl">👥</span>
                <div>
                  <strong className="text-gray-900">Accesso Limitato</strong>
                  <p className="text-gray-700 text-sm mt-1">
                    Solo personale autorizzato ha accesso ai dati personali.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <span className="text-2xl">🔍</span>
                <div>
                  <strong className="text-gray-900">Monitoraggio</strong>
                  <p className="text-gray-700 text-sm mt-1">
                    Controlli regolari per identificare vulnerabilità e
                    anomalie.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <span className="text-2xl">🔑</span>
                <div>
                  <strong className="text-gray-900">Credenziali Protette</strong>
                  <p className="text-gray-700 text-sm mt-1">
                    Le password dell'area riservata sono salvate solo come hash
                    cifrato (bcrypt) e l'accesso avviene con token di sessione a
                    scadenza.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <span className="text-2xl">🇪🇺</span>
                <div>
                  <strong className="text-gray-900">Server nell'UE</strong>
                  <p className="text-gray-700 text-sm mt-1">
                    Il database che contiene i dati personali è ospitato su
                    server situati nell'Unione Europea (Francoforte).
                  </p>
                </div>
              </div>
            </div>
            <p className="text-gray-700 mt-4 text-sm italic">
              ⚠️ Nonostante le misure di sicurezza adottate, nessun sistema è
              completamente sicuro. Ti invitiamo a utilizzare password complesse
              e a non condividere dati sensibili via email non criptata.
            </p>
          </section>

          {/* 9. Cookie */}
          <section id="cookie" className="mb-10 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              9. Cookie e Tecnologie di Tracciamento
            </h2>
            <p className="text-gray-700 mb-4">
              Questo sito utilizza esclusivamente strumenti di archiviazione
              tecnica: la preferenza espressa nel banner cookie e, per i soli
              utenti dell'area riservata, il token di sessione necessario a
              mantenere l'accesso. <strong>Non</strong> utilizziamo cookie di
              profilazione, pubblicitari o di analisi di terze parti. Per
              informazioni dettagliate su tipologie, finalità e gestione,
              consulta la nostra:
            </p>
            <Link
              to="/cookie-policy"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              <Cookie className="w-5 h-5" />
              Cookie Policy Completa
            </Link>
          </section>

          {/* 10. Modifiche */}
          <section id="modifiche" className="mb-10 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              10. Modifiche alla Privacy Policy
            </h2>
            <p className="text-gray-700 mb-4">
              Ci riserviamo il diritto di modificare questa Privacy Policy in
              qualsiasi momento. Le modifiche saranno pubblicate su questa
              pagina con indicazione della data di aggiornamento.
            </p>
            <p className="text-gray-700 mb-4">
              Ti invitiamo a consultare periodicamente questa pagina per essere
              informato sulle modalità di trattamento dei tuoi dati personali.
            </p>
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-2">
                Revisione del 01/09/2026
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 m-0">
                <li>
                  Chiarito che non registriamo l'indirizzo IP di chi lascia un
                  commento
                </li>
                <li>
                  Specificato che i messaggi del form di contatto non sono
                  archiviati nel database del sito
                </li>
                <li>
                  Aggiunte le informazioni su liste di iscrizione e log di invio
                  della newsletter, precisando che non tracciamo aperture e clic
                </li>
                <li>
                  Aggiunta la sezione sugli account dell'area riservata e la
                  relativa finalità
                </li>
                <li>
                  Indicati i fornitori di hosting e la localizzazione dei server
                  nell'Unione Europea
                </li>
                <li>
                  Precisata l'assenza di profilazione, di processi decisionali
                  automatizzati e di cookie di terze parti
                </li>
              </ul>
            </div>
          </section>

          {/* 11. Contatti */}
          <section id="contatti" className="mb-10 scroll-mt-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-7 h-7 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 m-0">
                11. Contatti
              </h2>
            </div>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-xl">
              <h3 className="text-2xl font-bold mb-4">Hai Domande?</h3>
              <p className="mb-6 text-lg">
                Per qualsiasi domanda relativa a questa Privacy Policy o al
                trattamento dei tuoi dati personali, puoi contattarci:
              </p>
              <div className="space-y-3 bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                <p>
                  <strong>Email:</strong>{" "}
                  <a
                    href="mailto:info@fuxture.net"
                    className="hover:underline font-mono"
                  >
                    info@fuxture.net
                  </a>
                </p>
                <p>
                  <strong>Nome:</strong> Domenico Spampinato
                </p>
                <p>
                  <strong>P.IVA:</strong> IT01937400891
                </p>
                <p>
                  <strong>Località:</strong> Carlentini, Italia
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-gray-200 pt-8 mt-12">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              ← Torna alla Homepage
            </Link>
            <div className="flex gap-4">
              <Link
                to="/cookie-policy"
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Cookie Policy
              </Link>
              <Link
                to="/terms"
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
