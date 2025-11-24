import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie, Settings, Trash2, CheckCircle, XCircle } from "lucide-react";

export default function CookiePolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Cookie className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Cookie Policy
          </h1>
          <p className="text-gray-600">
            Ultimo aggiornamento: <strong>24/11/2025</strong>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Informativa sull'uso dei cookie conforme alla normativa europea
          </p>
        </div>

        {/* Quick Summary */}
        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-10 rounded-lg">
          <h2 className="text-xl font-bold text-blue-900 mb-3">🍪 In Breve</h2>
          <p className="text-blue-800 text-sm leading-relaxed">
            Questo sito utilizza <strong>cookie tecnici</strong> necessari per
            il funzionamento del sito. Attualmente{" "}
            <strong>non utilizziamo cookie di profilazione o marketing</strong>.
            Puoi gestire le tue preferenze tramite le impostazioni del browser.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-gray-100 p-6 rounded-lg mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Indice dei Contenuti
          </h2>
          <ul className="space-y-2 text-blue-600">
            <li>
              <a href="#cosa-sono" className="hover:underline">
                1. Cosa sono i Cookie
              </a>
            </li>
            <li>
              <a href="#tipologie" className="hover:underline">
                2. Tipologie di Cookie
              </a>
            </li>
            <li>
              <a href="#cookie-utilizzati" className="hover:underline">
                3. Cookie Utilizzati su Questo Sito
              </a>
            </li>
            <li>
              <a href="#gestione" className="hover:underline">
                4. Come Gestire i Cookie
              </a>
            </li>
            <li>
              <a href="#terze-parti" className="hover:underline">
                5. Cookie di Terze Parti
              </a>
            </li>
            <li>
              <a href="#consenso" className="hover:underline">
                6. Consenso e Preferenze
              </a>
            </li>
            <li>
              <a href="#modifiche" className="hover:underline">
                7. Modifiche alla Cookie Policy
              </a>
            </li>
            <li>
              <a href="#contatti" className="hover:underline">
                8. Contatti
              </a>
            </li>
          </ul>
        </div>

        {/* Content Sections */}
        <div className="prose prose-blue max-w-none">
          {/* 1. Cosa sono i Cookie */}
          <section id="cosa-sono" className="mb-10 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. Cosa sono i Cookie
            </h2>
            <p className="text-gray-700 mb-4">
              I <strong>cookie</strong> sono piccoli file di testo che i siti
              web visitati inviano al browser dell'utente, dove vengono
              memorizzati per essere poi ritrasmessi agli stessi siti alla
              visita successiva.
            </p>
            <p className="text-gray-700 mb-4">
              I cookie possono essere utilizzati per diverse finalità:
              esecuzione di autenticazioni informatiche, monitoraggio di
              sessioni, memorizzazione di informazioni su specifiche
              configurazioni riguardanti gli utenti che accedono al server,
              facilitazione nella navigazione, analisi e tracciamento.
            </p>
            <div className="bg-gray-100 p-5 rounded-lg mt-4">
              <h3 className="font-bold text-gray-900 mb-2">
                Cookie Tecnici vs Cookie di Profilazione
              </h3>
              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900">Cookie Tecnici:</strong>
                    <p className="text-gray-700 text-sm mt-1">
                      Necessari per il funzionamento del sito. Non richiedono
                      consenso preventivo.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <Settings className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-gray-900">
                      Cookie di Profilazione:
                    </strong>
                    <p className="text-gray-700 text-sm mt-1">
                      Utilizzati per tracciare la navigazione e creare profili
                      pubblicitari. Richiedono consenso esplicito.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Tipologie */}
          <section id="tipologie" className="mb-10 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. Tipologie di Cookie
            </h2>
            <p className="text-gray-700 mb-4">
              I cookie possono essere classificati in base a diverse
              caratteristiche:
            </p>

            <div className="space-y-6">
              {/* Per Provenienza */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  A) Per Provenienza
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-600">
                    <h4 className="font-bold text-blue-900 mb-2">
                      Cookie di Prima Parte
                    </h4>
                    <p className="text-gray-700 text-sm">
                      Installati direttamente dal sito che stai visitando.
                      Controllati dal proprietario del sito.
                    </p>
                  </div>
                  <div className="bg-purple-50 p-5 rounded-lg border-l-4 border-purple-600">
                    <h4 className="font-bold text-purple-900 mb-2">
                      Cookie di Terze Parti
                    </h4>
                    <p className="text-gray-700 text-sm">
                      Installati da domini diversi da quello del sito visitato
                      (es. Google Analytics, social media).
                    </p>
                  </div>
                </div>
              </div>

              {/* Per Durata */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  B) Per Durata
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-5 rounded-lg border-l-4 border-green-600">
                    <h4 className="font-bold text-green-900 mb-2">
                      Cookie di Sessione
                    </h4>
                    <p className="text-gray-700 text-sm mb-2">
                      Temporanei, eliminati automaticamente alla chiusura del
                      browser.
                    </p>
                    <p className="text-xs text-gray-600 italic">
                      Durata: fino a chiusura browser
                    </p>
                  </div>
                  <div className="bg-orange-50 p-5 rounded-lg border-l-4 border-orange-600">
                    <h4 className="font-bold text-orange-900 mb-2">
                      Cookie Persistenti
                    </h4>
                    <p className="text-gray-700 text-sm mb-2">
                      Rimangono memorizzati sul dispositivo fino alla scadenza o
                      cancellazione manuale.
                    </p>
                    <p className="text-xs text-gray-600 italic">
                      Durata: da giorni a anni (variabile)
                    </p>
                  </div>
                </div>
              </div>

              {/* Per Finalità */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  C) Per Finalità
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-2">
                          Cookie Tecnici (Necessari)
                        </h4>
                        <p className="text-gray-700 text-sm mb-3">
                          Essenziali per il funzionamento del sito. Permettono
                          la navigazione e l'utilizzo delle funzionalità base.
                        </p>
                        <p className="text-xs text-green-700 bg-green-100 inline-block px-3 py-1 rounded-full font-medium">
                          ✓ Non richiedono consenso
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <div className="flex items-start gap-3">
                      <Settings className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-2">
                          Cookie Analitici
                        </h4>
                        <p className="text-gray-700 text-sm mb-3">
                          Raccolgono informazioni aggregate su come i visitatori
                          utilizzano il sito (es. pagine visitate, tempo di
                          permanenza).
                        </p>
                        <p className="text-xs text-blue-700 bg-blue-100 inline-block px-3 py-1 rounded-full font-medium">
                          ⚠️ Possono richiedere consenso (se non anonimizzati)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-2">
                          Cookie di Profilazione
                        </h4>
                        <p className="text-gray-700 text-sm mb-3">
                          Tracciano la navigazione per creare profili utente e
                          inviare pubblicità mirata.
                        </p>
                        <p className="text-xs text-red-700 bg-red-100 inline-block px-3 py-1 rounded-full font-medium">
                          ⚠️ Richiedono sempre consenso esplicito
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Cookie Utilizzati */}
          <section id="cookie-utilizzati" className="mb-10 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. Cookie Utilizzati su Questo Sito
            </h2>

            <div className="bg-green-50 border-l-4 border-green-600 p-6 mb-6 rounded-lg">
              <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Cookie Tecnici Necessari (Sempre Attivi)
              </h3>
              <p className="text-gray-700 text-sm mb-4">
                Questi cookie sono strettamente necessari per il funzionamento
                del sito e non possono essere disabilitati nei nostri sistemi.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-green-600 text-white">
                    <tr>
                      <th className="border border-green-700 px-4 py-2 text-left">
                        Nome Cookie
                      </th>
                      <th className="border border-green-700 px-4 py-2 text-left">
                        Finalità
                      </th>
                      <th className="border border-green-700 px-4 py-2 text-left">
                        Durata
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    <tr>
                      <td className="border border-gray-300 px-4 py-3 font-mono text-xs">
                        cookieConsent
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        Memorizza le preferenze dell'utente riguardo l'uso dei
                        cookie
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        12 mesi
                      </td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-mono text-xs">
                        session_id
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        Mantiene la sessione dell'utente durante la navigazione
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        Sessione
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-3 font-mono text-xs">
                        theme_preference
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        Memorizza le preferenze visive dell'utente (es. dark
                        mode)
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        6 mesi
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-gray-100 border-l-4 border-gray-400 p-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-gray-600" />
                Cookie NON Utilizzati su Questo Sito
              </h3>
              <p className="text-gray-700 text-sm">
                Attualmente <strong>NON utilizziamo</strong>:
              </p>
              <ul className="list-disc list-inside text-gray-700 text-sm space-y-1 ml-4 mt-2">
                <li>
                  Cookie di Google Analytics o altri strumenti di tracciamento
                </li>
                <li>Cookie di profilazione pubblicitaria</li>
                <li>Cookie di social media (Facebook Pixel, Twitter, etc.)</li>
                <li>Cookie di remarketing o retargeting</li>
              </ul>
              <p className="text-xs text-gray-600 mt-3 italic">
                ℹ️ Se in futuro dovessimo introdurre cookie di terze parti,
                questa policy sarà aggiornata di conseguenza e ti verrà
                richiesto il consenso esplicito.
              </p>
            </div>
          </section>

          {/* 4. Gestione Cookie */}
          <section id="gestione" className="mb-10 scroll-mt-6">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-7 h-7 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 m-0">
                4. Come Gestire e Disabilitare i Cookie
              </h2>
            </div>

            <p className="text-gray-700 mb-4">
              Puoi gestire o disabilitare i cookie attraverso le impostazioni
              del tuo browser. Nota che disabilitare i cookie tecnici potrebbe
              compromettere alcune funzionalità del sito.
            </p>

            <div className="space-y-4">
              {/* Chrome */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">🌐</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">
                      Google Chrome
                    </h3>
                    <p className="text-gray-700 text-sm mb-2">
                      Impostazioni → Privacy e sicurezza → Cookie e altri dati
                      dei siti
                    </p>
                    <a
                      href="https://support.google.com/chrome/answer/95647"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm font-medium"
                    >
                      Guida completa →
                    </a>
                  </div>
                </div>
              </div>

              {/* Firefox */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">🦊</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">
                      Mozilla Firefox
                    </h3>
                    <p className="text-gray-700 text-sm mb-2">
                      Impostazioni → Privacy e sicurezza → Cookie e dati dei
                      siti web
                    </p>
                    <a
                      href="https://support.mozilla.org/it/kb/Gestione%20dei%20cookie"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm font-medium"
                    >
                      Guida completa →
                    </a>
                  </div>
                </div>
              </div>

              {/* Safari */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">🧭</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">Safari</h3>
                    <p className="text-gray-700 text-sm mb-2">
                      Preferenze → Privacy → Gestisci dati dei siti web
                    </p>
                    <a
                      href="https://support.apple.com/it-it/guide/safari/sfri11471/mac"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm font-medium"
                    >
                      Guida completa →
                    </a>
                  </div>
                </div>
              </div>

              {/* Edge */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">🌊</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">
                      Microsoft Edge
                    </h3>
                    <p className="text-gray-700 text-sm mb-2">
                      Impostazioni → Cookie e autorizzazioni sito → Gestisci ed
                      elimina cookie e dati dei siti
                    </p>
                    <a
                      href="https://support.microsoft.com/it-it/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm font-medium"
                    >
                      Guida completa →
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 mt-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-yellow-600" />
                Cancellare i Cookie Esistenti
              </h3>
              <p className="text-gray-700 text-sm">
                Puoi cancellare tutti i cookie già presenti sul tuo dispositivo
                accedendo alle impostazioni del browser e selezionando l'opzione
                per eliminare i dati di navigazione o i cookie. Questa
                operazione rimuoverà anche le tue preferenze salvate su altri
                siti web.
              </p>
            </div>
          </section>

          {/* 5. Cookie Terze Parti */}
          <section id="terze-parti" className="mb-10 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. Cookie di Terze Parti
            </h2>
            <p className="text-gray-700 mb-4">
              Alcuni contenuti incorporati nel sito (es. video YouTube, mappe
              Google Maps, social media embed) possono utilizzare cookie di
              terze parti. Questi cookie sono controllati direttamente dalle
              terze parti.
            </p>

            <div className="bg-gray-100 p-6 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-3">
                Servizi di Terze Parti (quando presenti):
              </h3>
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-2">YouTube</h4>
                  <p className="text-gray-700 text-sm mb-2">
                    I video incorporati possono installare cookie di YouTube
                    (Google).
                  </p>
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Privacy Policy YouTube →
                  </a>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-2">Google Maps</h4>
                  <p className="text-gray-700 text-sm mb-2">
                    Le mappe incorporate possono utilizzare cookie di Google
                    Maps.
                  </p>
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Privacy Policy Google →
                  </a>
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-4 italic">
                ℹ️ Non abbiamo controllo sui cookie installati da servizi di
                terze parti. Ti invitiamo a consultare le rispettive privacy
                policy per maggiori informazioni.
              </p>
            </div>
          </section>

          {/* 6. Consenso */}
          <section id="consenso" className="mb-10 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. Consenso e Gestione Preferenze
            </h2>
            <p className="text-gray-700 mb-4">
              Quando visiti il nostro sito per la prima volta, ti viene mostrato
              un banner informativo sui cookie con le seguenti opzioni:
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-5 rounded-lg border-2 border-blue-300">
                <h3 className="font-bold text-blue-900 mb-2">
                  ✓ Accetta Tutti
                </h3>
                <p className="text-gray-700 text-sm">
                  Acconsenti all'utilizzo di tutti i cookie, inclusi quelli di
                  terze parti (quando presenti).
                </p>
              </div>

              <div className="bg-green-50 p-5 rounded-lg border-2 border-green-300">
                <h3 className="font-bold text-green-900 mb-2">
                  ⚙️ Solo Necessari
                </h3>
                <p className="text-gray-700 text-sm">
                  Utilizziamo solo i cookie tecnici essenziali. Altri cookie
                  sono disabilitati.
                </p>
              </div>

              <div className="bg-purple-50 p-5 rounded-lg border-2 border-purple-300">
                <h3 className="font-bold text-purple-900 mb-2">
                  🎨 Personalizza
                </h3>
                <p className="text-gray-700 text-sm">
                  Accedi a questa pagina per vedere i dettagli e gestire le
                  preferenze manualmente.
                </p>
              </div>
            </div>

            <div className="bg-blue-600 text-white p-6 rounded-lg mt-6">
              <h3 className="font-bold text-xl mb-3">
                Modifica le Tue Preferenze
              </h3>
              <p className="mb-4">
                Puoi modificare le tue preferenze sui cookie in qualsiasi
                momento cliccando il pulsante qui sotto:
              </p>
              <button
                onClick={() => {
                  localStorage.removeItem("cookieConsent");
                  window.location.reload();
                }}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
              >
                🍪 Gestisci Preferenze Cookie
              </button>
            </div>
          </section>

          {/* 7. Modifiche */}
          <section id="modifiche" className="mb-10 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              7. Modifiche alla Cookie Policy
            </h2>
            <p className="text-gray-700 mb-4">
              Ci riserviamo il diritto di modificare questa Cookie Policy in
              qualsiasi momento, specialmente in caso di introduzione di nuovi
              cookie o servizi di terze parti.
            </p>
            <p className="text-gray-700">
              Le modifiche saranno pubblicate su questa pagina con indicazione
              della data di aggiornamento. Ti invitiamo a consultare
              periodicamente questa pagina per rimanere informato.
            </p>
          </section>

          {/* 8. Contatti */}
          <section id="contatti" className="mb-10 scroll-mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              8. Contatti
            </h2>
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-xl">
              <h3 className="text-2xl font-bold mb-4">Hai Domande?</h3>
              <p className="mb-6 text-lg">
                Per qualsiasi domanda relativa a questa Cookie Policy, puoi
                contattarci:
              </p>
              <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                <p className="mb-2">
                  <strong>Email:</strong>{" "}
                  <a
                    href="mailto:info@fuxture.net
"
                    className="hover:underline font-mono"
                  >
                    info@fuxture.net
                  </a>
                </p>
                <p>
                  <strong>Nome:</strong> Domenico Spampinato
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
                to="/privacy-policy"
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Privacy Policy
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
