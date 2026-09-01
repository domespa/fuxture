import { useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, AlertTriangle, Scale, Lock, Copyright } from "lucide-react";

export default function Terms() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Scale className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Termini e Condizioni di Utilizzo
          </h1>
          <p className="text-gray-600">
            Ultimo aggiornamento: <strong>01/09/2026</strong>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Regolamento per l'utilizzo di questo sito web
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-10 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-yellow-900 mb-2">Importante</h3>
              <p className="text-yellow-800 text-sm">
                Utilizzando questo sito web, accetti i seguenti termini e
                condizioni. Se non sei d'accordo con questi termini, ti
                preghiamo di non utilizzare il sito.
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
              <a href="#accettazione" className="hover:underline">
                1. Accettazione dei Termini
              </a>
            </li>
            <li>
              <a href="#descrizione" className="hover:underline">
                2. Descrizione del Servizio
              </a>
            </li>
            <li>
              <a href="#utilizzo" className="hover:underline">
                3. Utilizzo del Sito
              </a>
            </li>
            <li>
              <a href="#proprieta" className="hover:underline">
                4. Proprietà Intellettuale
              </a>
            </li>
            <li>
              <a href="#contenuti-utente" className="hover:underline">
                5. Contenuti Generati dagli Utenti
              </a>
            </li>
            <li>
              <a href="#comportamento" className="hover:underline">
                6. Comportamento Vietato
              </a>
            </li>
            <li>
              <a href="#newsletter" className="hover:underline">
                7. Newsletter e Comunicazioni
              </a>
            </li>
            <li>
              <a href="#disclaimer" className="hover:underline">
                8. Esclusione di Responsabilità
              </a>
            </li>
            <li>
              <a href="#limitazioni" className="hover:underline">
                9. Limitazioni di Responsabilità
              </a>
            </li>
            <li>
              <a href="#link-esterni" className="hover:underline">
                10. Link Esterni, Pubblicità e Affiliazioni
              </a>
            </li>
            <li>
              <a href="#modifiche" className="hover:underline">
                11. Modifiche ai Termini
              </a>
            </li>
            <li>
              <a href="#legge" className="hover:underline">
                12. Legge Applicabile e Foro Competente
              </a>
            </li>
            <li>
              <a href="#contatti" className="hover:underline">
                13. Contatti
              </a>
            </li>
          </ul>
        </div>

        {/* Content Sections */}
        <div className="prose prose-blue max-w-none">
          {/* 1. Accettazione */}
          <section id="accettazione" className="mb-10 scroll-mt-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-7 h-7 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 m-0">
                1. Accettazione dei Termini
              </h2>
            </div>
            <p className="text-gray-700 mb-4">
              Questi Termini e Condizioni ("Termini") disciplinano l'accesso e
              l'utilizzo del sito web{" "}
              <strong>Fuxture (https://fuxture.net/)</strong> (il "Sito"),
              gestito da:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-700 mb-2">
                <strong>Titolare:</strong> Domenico Spampinato
              </p>
              <p className="text-gray-700 mb-2">
                <strong>P.IVA:</strong> IT01937400891
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Sede:</strong> via Frat. Cervi, 11, Carlentini (SR),
                Italia
              </p>
              <p className="text-gray-700">
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:info@fuxture.net"
                  className="text-blue-600 hover:underline"
                >
                  info@fuxture.net
                </a>
              </p>
            </div>
            <p className="text-gray-700 mt-4">
              Accedendo o utilizzando il Sito, dichiari di aver letto, compreso
              e accettato questi Termini. Se non accetti questi Termini, non
              devi utilizzare il Sito.
            </p>
          </section>

          {/* 2. Descrizione */}
          <section id="descrizione" className="mb-10 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. Descrizione del Servizio
            </h2>
            <p className="text-gray-700 mb-4">
              Il Sito è un blog personale che offre contenuti informativi,
              articoli, guide e approfondimenti su economia e finanza
              personale, risparmio, assicurazioni, tecnologia e attualità.
            </p>
            <p className="text-gray-700">I servizi offerti includono:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-2">
              <li>Lettura di articoli e contenuti pubblicati</li>
              <li>
                Consultazione di titoli di notizie provenienti da feed RSS di
                testate giornalistiche esterne, riportati con indicazione della
                fonte e link all'articolo originale
              </li>
              <li>
                Iscrizione alla newsletter per ricevere aggiornamenti periodici
              </li>
              <li>
                Commenti e interazione con i contenuti (quando disponibile)
              </li>
              <li>Form di contatto per richieste dirette</li>
            </ul>
            <p className="text-gray-700 mt-4 text-sm italic">
              ℹ️ L'area riservata del Sito è destinata al solo Titolare e ai
              collaboratori autorizzati: la registrazione non è aperta al
              pubblico e la semplice consultazione del blog non richiede la
              creazione di un account.
            </p>
            <p className="text-gray-700 mt-4">
              Ci riserviamo il diritto di modificare, sospendere o interrompere
              qualsiasi parte del Sito in qualsiasi momento senza preavviso.
            </p>
          </section>

          {/* 3. Utilizzo */}
          <section id="utilizzo" className="mb-10 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. Utilizzo del Sito
            </h2>
            <p className="text-gray-700 mb-4">
              L'utilizzo del Sito è consentito solo per scopi personali e non
              commerciali, nel rispetto delle leggi vigenti.
            </p>
            <div className="bg-green-50 border-l-4 border-green-600 p-5 rounded-lg mb-4">
              <h3 className="font-bold text-green-900 mb-2">✓ È Consentito:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Leggere e visualizzare i contenuti</li>
                <li>Condividere link agli articoli sui social media</li>
                <li>
                  Citare brevi estratti con attribuzione e link alla fonte
                </li>
                <li>Iscriversi alla newsletter</li>
                <li>Contattarci tramite i form disponibili</li>
              </ul>
            </div>
            <div className="bg-red-50 border-l-4 border-red-600 p-5 rounded-lg">
              <h3 className="font-bold text-red-900 mb-2">
                ✗ Non è Consentito:
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>
                  Copiare, riprodurre o ripubblicare contenuti integralmente
                  senza autorizzazione
                </li>
                <li>
                  Utilizzare contenuti per scopi commerciali senza consenso
                </li>
                <li>
                  Effettuare scraping automatico o estrazione massiva di dati
                </li>
                <li>Modificare o alterare i contenuti</li>
                <li>Rimuovere watermark, copyright o attribuzioni</li>
              </ul>
            </div>
          </section>

          {/* 4. Proprietà Intellettuale */}
          <section id="proprieta" className="mb-10 scroll-mt-6">
            <div className="flex items-center gap-3 mb-4">
              <Copyright className="w-7 h-7 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 m-0">
                4. Proprietà Intellettuale
              </h2>
            </div>
            <p className="text-gray-700 mb-4">
              Tutti i contenuti presenti sul Sito, inclusi ma non limitati a:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Articoli, testi e scritti</li>
              <li>Immagini, foto e grafiche</li>
              <li>Video e contenuti multimediali</li>
              <li>Logo, design e layout del sito</li>
              <li>Codice sorgente e struttura tecnica</li>
            </ul>
            <p className="text-gray-700 mb-4">
              sono di proprietà esclusiva di{" "}
              <strong>Domenico Spampinato</strong> o dei rispettivi titolari e
              sono protetti dalle leggi italiane ed internazionali sul diritto
              d'autore e sulla proprietà intellettuale.
            </p>
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-4">
              <h3 className="font-bold text-gray-900 mb-2">
                Contenuti di terzi
              </h3>
              <p className="text-gray-700 text-sm">
                Fanno eccezione i contenuti provenienti da terze parti: titoli e
                sommari delle notizie ripresi dai feed RSS, immagini e marchi
                dei partner commerciali, citazioni e materiali su licenza
                restano di proprietà dei rispettivi titolari e sono riportati
                con finalità informativa, nei limiti del diritto di cronaca e di
                citazione. Se ritieni che un contenuto pubblicato violi un tuo
                diritto, scrivi a{" "}
                <a
                  href="mailto:info@fuxture.net"
                  className="text-blue-600 hover:underline"
                >
                  info@fuxture.net
                </a>{" "}
                indicando l'URL: provvederemo alla verifica e, se necessario,
                alla rimozione.
              </p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-600">
              <h3 className="font-bold text-blue-900 mb-3">
                © Copyright 2025-2026 - Domenico Spampinato
              </h3>
              <p className="text-gray-700 text-sm mb-3">
                Tutti i diritti riservati. È vietata la riproduzione, anche
                parziale, senza autorizzazione scritta.
              </p>
              <p className="text-gray-700 text-sm">
                <strong>Uso lecito (Fair Use):</strong> È consentita la
                citazione di brevi estratti (max 200 parole) con:
              </p>
              <ul className="list-disc list-inside text-gray-700 text-sm space-y-1 ml-4 mt-2">
                <li>Attribuzione chiara all'autore</li>
                <li>Link diretto all'articolo originale</li>
                <li>Indicazione della fonte</li>
              </ul>
            </div>
          </section>

          {/* 5. Contenuti Utente */}
          <section id="contenuti-utente" className="mb-10 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. Contenuti Generati dagli Utenti
            </h2>
            <p className="text-gray-700 mb-4">
              Se il Sito offre la possibilità di lasciare commenti o altri
              contenuti ("Contenuti Utente"), accetti che:
            </p>
            <div className="space-y-4">
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2">
                  a) Responsabilità dei Contenuti
                </h3>
                <p className="text-gray-700 text-sm">
                  Sei l'unico responsabile dei contenuti che pubblichi. Non devi
                  pubblicare contenuti illeciti, offensivi, diffamatori,
                  discriminatori o che violino i diritti di terzi.
                </p>
              </div>

              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2">
                  b) Licenza d'Uso
                </h3>
                <p className="text-gray-700 text-sm">
                  Pubblicando contenuti sul Sito, concedi al Titolare una
                  licenza non esclusiva, gratuita e mondiale per utilizzare,
                  riprodurre e mostrare pubblicamente tali contenuti sul Sito.
                </p>
              </div>

              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2">c) Moderazione</h3>
                <p className="text-gray-700 text-sm">
                  I commenti sono sottoposti a{" "}
                  <strong>moderazione preventiva</strong>: dopo l'invio restano
                  in attesa e diventano visibili solo una volta approvati. Ci
                  riserviamo il diritto di moderare, modificare o rimuovere
                  qualsiasi contenuto che riterremo inappropriato, offensivo o
                  in violazione di questi Termini, senza preavviso e senza
                  obbligo di motivazione.
                </p>
              </div>

              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2">
                  d) Divieto di Spam
                </h3>
                <p className="text-gray-700 text-sm">
                  È vietato utilizzare i commenti o altri form per inviare spam,
                  pubblicità non autorizzata o link a siti esterni per scopi
                  promozionali.
                </p>
              </div>

              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-2">
                  e) Dati Richiesti per Commentare
                </h3>
                <p className="text-gray-700 text-sm">
                  Per pubblicare un commento sono richiesti un nome e un
                  indirizzo email: il nome viene mostrato pubblicamente accanto
                  al commento, l'email <strong>non</strong> viene pubblicata e
                  serve solo per la moderazione e per eventuali comunicazioni
                  relative al commento. Puoi chiedere in ogni momento la
                  rimozione di un commento e dei dati collegati scrivendo a{" "}
                  <a
                    href="mailto:info@fuxture.net"
                    className="text-blue-600 hover:underline"
                  >
                    info@fuxture.net
                  </a>
                  .
                </p>
              </div>
            </div>
          </section>

          {/* 6. Comportamento Vietato */}
          <section id="comportamento" className="mb-10 scroll-mt-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-7 h-7 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900 m-0">
                6. Comportamento Vietato
              </h2>
            </div>
            <p className="text-gray-700 mb-4">
              Durante l'utilizzo del Sito è <strong>vietato</strong>:
            </p>
            <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-600">
              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <span className="text-red-600 font-bold flex-shrink-0">
                    ✗
                  </span>
                  <span>Violare leggi italiane, europee o internazionali</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 font-bold flex-shrink-0">
                    ✗
                  </span>
                  <span>
                    Pubblicare contenuti diffamatori, offensivi, discriminatori,
                    pornografici o illegali
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 font-bold flex-shrink-0">
                    ✗
                  </span>
                  <span>
                    Violare diritti di proprietà intellettuale di terzi
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 font-bold flex-shrink-0">
                    ✗
                  </span>
                  <span>
                    Tentare di accedere a aree riservate o sistemi non
                    autorizzati (hacking)
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 font-bold flex-shrink-0">
                    ✗
                  </span>
                  <span>
                    Trasmettere virus, malware o qualsiasi codice dannoso
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 font-bold flex-shrink-0">
                    ✗
                  </span>
                  <span>
                    Effettuare attacchi DDoS o sovraccaricare i server
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 font-bold flex-shrink-0">
                    ✗
                  </span>
                  <span>
                    Utilizzare bot, scraper o sistemi automatizzati non
                    autorizzati
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 font-bold flex-shrink-0">
                    ✗
                  </span>
                  <span>Impersonare altre persone o entità</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-red-600 font-bold flex-shrink-0">
                    ✗
                  </span>
                  <span>Molestare, minacciare o intimidire altri utenti</span>
                </li>
              </ul>
            </div>
            <p className="text-gray-700 mt-4 text-sm">
              <strong>Conseguenze:</strong> La violazione di questi termini può
              comportare il blocco dell'accesso al Sito e, nei casi più gravi,
              azioni legali.
            </p>
          </section>

          {/* 7. Newsletter */}
          <section id="newsletter" className="mb-10 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              7. Newsletter e Comunicazioni
            </h2>
            <p className="text-gray-700 mb-4">
              Iscrivendoti alla newsletter, accetti di ricevere comunicazioni
              periodiche via email contenenti:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Notifiche di nuovi articoli pubblicati</li>
              <li>Contenuti esclusivi per iscritti</li>
              <li>Aggiornamenti e novità del blog</li>
              <li>Comunicazioni informative (non spam)</li>
              <li>
                Comunicazioni promozionali relative a offerte di partner
                commerciali, sempre identificabili come tali all'interno del
                messaggio
              </li>
            </ul>
            <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-600">
              <h3 className="font-bold text-blue-900 mb-2">
                Disiscrizione (Opt-out)
              </h3>
              <p className="text-gray-700 text-sm">
                Puoi disiscriverti dalla newsletter in qualsiasi momento
                cliccando sul link "Unsubscribe" presente in ogni email, oppure
                contattandoci all'indirizzo{" "}
                <a
                  href="mailto:info@fuxture.net"
                  className="text-blue-600 hover:underline"
                >
                  info@fuxture.net
                </a>
                .
              </p>
            </div>
            <p className="text-gray-700 mt-4 text-sm">
              Per maggiori informazioni sul trattamento dei dati newsletter,
              consulta la nostra{" "}
              <Link
                to="/privacy-policy"
                className="text-blue-600 hover:underline font-medium"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          {/* 8. Disclaimer */}
          <section id="disclaimer" className="mb-10 scroll-mt-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-7 h-7 text-yellow-600" />
              <h2 className="text-2xl font-bold text-gray-900 m-0">
                8. Esclusione di Responsabilità (Disclaimer)
              </h2>
            </div>
            <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
              <p className="text-gray-700 mb-3">
                I contenuti del Sito sono forniti "così come sono" (AS IS) a
                scopo puramente informativo e divulgativo.
              </p>
              <p className="text-gray-700 mb-3">
                <strong>Non garantiamo:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-3">
                <li>
                  L'accuratezza, la completezza o l'attualità delle informazioni
                </li>
                <li>L'assenza di errori o interruzioni del servizio</li>
                <li>
                  Che il Sito sia sempre disponibile e privo di virus o malware
                </li>
                <li>
                  Risultati specifici dall'utilizzo delle informazioni fornite
                </li>
              </ul>
              <p className="text-gray-700">
                <strong>I contenuti NON costituiscono:</strong>
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mt-2">
                <li>
                  Consulenza professionale (legale, fiscale, medica, etc.)
                </li>
                <li>Raccomandazioni di investimento o finanziarie</li>
                <li>Pareri tecnici vincolanti</li>
              </ul>
            </div>
            <p className="text-gray-700 mt-4 text-sm italic">
              ⚠️ Per decisioni importanti, ti consigliamo di consultare sempre
              un professionista qualificato nel settore specifico.
            </p>
          </section>

          {/* 9. Limitazioni */}
          <section id="limitazioni" className="mb-10 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              9. Limitazioni di Responsabilità
            </h2>
            <p className="text-gray-700 mb-4">
              Nei limiti consentiti dalla legge italiana, il Titolare del Sito
              <strong> non sarà responsabile</strong> per:
            </p>
            <div className="space-y-3">
              <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
                <h3 className="font-bold text-gray-900 mb-2">
                  Danni Diretti e Indiretti
                </h3>
                <p className="text-gray-700 text-sm">
                  Qualsiasi danno diretto, indiretto, incidentale o conseguente
                  derivante dall'utilizzo o dall'impossibilità di utilizzare il
                  Sito.
                </p>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
                <h3 className="font-bold text-gray-900 mb-2">
                  Perdita di Dati
                </h3>
                <p className="text-gray-700 text-sm">
                  Perdita di dati, profitti, opportunità commerciali o altri
                  danni economici derivanti dall'uso del Sito.
                </p>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
                <h3 className="font-bold text-gray-900 mb-2">
                  Contenuti di Terzi
                </h3>
                <p className="text-gray-700 text-sm">
                  Contenuti pubblicati da utenti terzi o accessibili tramite
                  link esterni (vedi sezione 10).
                </p>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
                <h3 className="font-bold text-gray-900 mb-2">
                  Interruzioni del Servizio
                </h3>
                <p className="text-gray-700 text-sm">
                  Interruzioni, malfunzionamenti o sospensione del Sito per
                  manutenzione, aggiornamenti o cause di forza maggiore.
                </p>
              </div>
            </div>
            <p className="text-gray-700 mt-4 text-sm">
              L'utilizzo del Sito avviene a tuo esclusivo rischio e
              responsabilità.
            </p>
          </section>

          {/* 10. Link Esterni */}
          <section id="link-esterni" className="mb-10 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              10. Link Esterni, Pubblicità e Affiliazioni
            </h2>
            <p className="text-gray-700 mb-4">
              Il Sito può contenere link a siti web di terze parti a scopo
              informativo o di approfondimento, inclusi i link agli articoli
              originali delle testate da cui riprendiamo i titoli delle notizie.
            </p>
            <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-600 mb-4">
              <h3 className="font-bold text-blue-900 mb-2">
                Responsabilità Limitata
              </h3>
              <p className="text-gray-700 text-sm mb-2">
                Non abbiamo alcun controllo sui contenuti, le politiche privacy
                o le pratiche dei siti esterni linkati.
              </p>
              <p className="text-gray-700 text-sm">
                <strong>Non siamo responsabili</strong> per:
              </p>
              <ul className="list-disc list-inside text-gray-700 text-sm space-y-1 ml-4 mt-2">
                <li>Contenuti di siti esterni</li>
                <li>Danni o perdite causati da siti di terzi</li>
                <li>Violazioni di privacy su siti esterni</li>
                <li>Disponibilità o funzionamento dei link</li>
              </ul>
            </div>
            <div className="bg-yellow-50 p-5 rounded-lg border-l-4 border-yellow-500 mb-4">
              <h3 className="font-bold text-gray-900 mb-2">
                Contenuti Promozionali e Link di Affiliazione
              </h3>
              <p className="text-gray-700 text-sm mb-2">
                Alcuni articoli e alcune comunicazioni via email possono
                contenere <strong>link di affiliazione</strong> o spazi
                pubblicitari: se acquisti un prodotto o sottoscrivi un servizio
                passando da quei link, il Titolare può percepire una
                commissione, <strong>senza alcun costo aggiuntivo per te</strong>.
              </p>
              <p className="text-gray-700 text-sm mb-2">
                I contenuti promozionali sono identificabili come tali e non
                alterano il giudizio espresso negli articoli. La presenza di un
                link non costituisce garanzia, raccomandazione personalizzata o
                consulenza sul prodotto o sul servizio segnalato.
              </p>
              <p className="text-gray-700 text-sm">
                Il rapporto contrattuale relativo a prodotti o servizi acquistati
                presso terzi intercorre esclusivamente tra te e il fornitore: il
                Titolare non è parte di tale rapporto e non risponde di
                condizioni economiche, consegna, assistenza o garanzie.
              </p>
            </div>
            <p className="text-gray-700 text-sm italic">
              ⚠️ Ti consigliamo di leggere i termini e le condizioni dei siti
              esterni prima di fornire dati personali o effettuare transazioni.
            </p>
          </section>

          {/* 11. Modifiche */}
          <section id="modifiche" className="mb-10 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              11. Modifiche ai Termini di Servizio
            </h2>
            <p className="text-gray-700 mb-4">
              Ci riserviamo il diritto di modificare questi Termini in qualsiasi
              momento, a nostra esclusiva discrezione.
            </p>
            <div className="bg-gray-100 p-5 rounded-lg border border-gray-300">
              <h3 className="font-bold text-gray-900 mb-2">
                Come Verrai Informato
              </h3>
              <ul className="list-disc list-inside text-gray-700 text-sm space-y-2 ml-4">
                <li>
                  Le modifiche saranno pubblicate su questa pagina con
                  indicazione della nuova data di aggiornamento
                </li>
                <li>
                  Per modifiche sostanziali, potremo inviare una notifica via
                  email agli iscritti alla newsletter
                </li>
                <li>
                  Continuando a utilizzare il Sito dopo le modifiche, accetti
                  automaticamente i nuovi Termini
                </li>
              </ul>
            </div>
            <p className="text-gray-700 mt-4 mb-4">
              Ti invitiamo a consultare periodicamente questa pagina per
              rimanere aggiornato sulle eventuali modifiche.
            </p>
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-2">
                Revisione del 01/09/2026
              </h3>
              <ul className="list-disc list-inside text-gray-700 text-sm space-y-2 ml-4 m-0">
                <li>
                  Descritti gli argomenti effettivamente trattati dal blog e il
                  servizio di rassegna delle notizie da feed RSS
                </li>
                <li>
                  Precisato che l'area riservata non è aperta alla registrazione
                  del pubblico
                </li>
                <li>
                  Aggiunta la clausola sui contenuti di terzi e la procedura di
                  segnalazione per le violazioni di copyright
                </li>
                <li>
                  Chiarito che i commenti sono soggetti a moderazione preventiva
                  e quali dati sono richiesti per pubblicarli
                </li>
                <li>
                  Introdotta la sezione su pubblicità e link di affiliazione
                </li>
                <li>
                  Precisata la tutela del foro del consumatore e aggiunto il
                  riferimento alla piattaforma ODR europea
                </li>
              </ul>
            </div>
          </section>

          {/* 12. Legge Applicabile */}
          <section id="legge" className="mb-10 scroll-mt-6">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-7 h-7 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 m-0">
                12. Legge Applicabile e Foro Competente
              </h2>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-600">
              <p className="text-gray-700 mb-3">
                Questi Termini sono regolati e interpretati secondo le{" "}
                <strong>leggi italiane</strong>, in conformità con:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>Codice Civile Italiano</li>
                <li>Codice del Consumo (D.Lgs. 206/2005)</li>
                <li>
                  Regolamento UE 2016/679 (GDPR) per la protezione dei dati
                </li>
                <li>Direttiva eCommerce (D.Lgs. 70/2003)</li>
              </ul>
              <p className="text-gray-700 mb-2">
                <strong>Foro Competente:</strong>
              </p>
              <p className="text-gray-700 mb-3">
                Per qualsiasi controversia derivante da questi Termini sarà
                competente il <strong>Foro di Catania (CT), Italia</strong>.
              </p>
              <p className="text-gray-700">
                Se utilizzi il Sito in qualità di{" "}
                <strong>consumatore</strong>, resta però ferma la competenza
                inderogabile del giudice del luogo in cui risiedi o hai eletto
                domicilio (art. 66-bis del Codice del Consumo): la clausola sul
                Foro di Catania non si applica nei tuoi confronti.
              </p>
            </div>
            <p className="text-gray-700 mt-4 text-sm">
              Se sei un consumatore residente nell'UE, hai diritto a presentare
              reclamo presso l'autorità competente del tuo Paese di residenza e
              puoi ricorrere alla piattaforma europea di risoluzione online
              delle controversie (ODR), disponibile all'indirizzo{" "}
              <a
                href="https://consumer-redress.ec.europa.eu/index_it"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                consumer-redress.ec.europa.eu
              </a>
              .
            </p>
          </section>

          {/* 13. Contatti */}
          <section id="contatti" className="mb-10 scroll-mt-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-7 h-7 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 m-0">
                13. Contatti
              </h2>
            </div>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-xl">
              <h3 className="text-2xl font-bold mb-4">Hai Domande?</h3>
              <p className="mb-6 text-lg">
                Per qualsiasi domanda relativa a questi Termini e Condizioni,
                puoi contattarci:
              </p>
              <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm space-y-2">
                <p>
                  <strong>Nome:</strong> Domenico Spampinato
                </p>
                <p>
                  <strong>P.IVA:</strong> IT01937400891
                </p>
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
                  <strong>Località:</strong> Carlentini (SR), Italia
                </p>
              </div>
              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-sm opacity-90">
                  Ti risponderemo nel più breve tempo possibile, generalmente
                  entro 48-72 ore lavorative.
                </p>
              </div>
            </div>
          </section>

          {/* Accettazione Finale */}
          <div className="bg-green-50 border-2 border-green-500 p-8 rounded-xl text-center mt-12">
            <h3 className="text-2xl font-bold text-green-900 mb-4">
              ✓ Accettazione dei Termini
            </h3>
            <p className="text-gray-700 mb-4">
              Utilizzando questo sito web, confermi di aver letto, compreso e
              accettato integralmente i presenti Termini e Condizioni di
              Utilizzo.
            </p>
            <p className="text-sm text-gray-600">
              Ultimo aggiornamento: <strong>01/09/2026</strong>
            </p>
          </div>
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
                to="/privacy-policy"
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Privacy Policy
              </Link>
              <Link
                to="/cookie-policy"
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
