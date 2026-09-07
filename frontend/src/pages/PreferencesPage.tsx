import { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Mail,
  Eye,
  CheckCircle,
  AlertCircle,
  Loader2,
  Save,
} from "lucide-react";
import { subscribersAPI } from "@/services/api";

// ============================================================================
// AREA PREFERENZE
//
// Le Linee Guida del Garante del 17/04/2026 in materia di tracking pixel
// (par. 6) richiedono un link nel footer di ogni messaggio che conduca a
// "un'area dedicata all'esercizio dei suoi diritti", nella quale l'interessato
// possa "cessare l'inoltro di e-mail indesiderate ... ovvero cessare soltanto
// la ricezione dei tracking pixel, continuando cioe' a ricevere le
// comunicazioni di posta elettronica prive di tali marcatori".
//
// Le due scelte sono quindi indipendenti, e chi rifiuta il solo tracciamento
// non subisce alcuna limitazione del servizio.
// ============================================================================

interface Preferences {
  email: string;
  name: string | null;
  subscribed: boolean;
  trackingConsent: boolean;
}

export default function PreferencesPage() {
  const { id } = useParams<{ id: string }>();

  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const loadPreferences = useCallback(async () => {
    try {
      setPreferences(await subscribersAPI.getPreferences(id as string));
    } catch {
      setError(
        "Non abbiamo trovato questa iscrizione, oppure il servizio non è raggiungibile."
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadPreferences();
  }, [loadPreferences]);

  const save = async (changes: Partial<Preferences>) => {
    if (!preferences) return;

    setIsSaving(true);
    setSaved(false);
    setError("");

    try {
      const result = await subscribersAPI.updatePreferences(
        id as string,
        changes
      );
      setPreferences({ ...preferences, ...result.preferences });
      setSaved(true);
    } catch {
      setError("Errore di connessione. Riprova più tardi.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8 md:p-12">
        <div className="text-center mb-8">
          <Mail className="w-14 h-14 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Le tue preferenze
          </h1>
          {preferences && (
            <p className="text-gray-600 text-sm">{preferences.email}</p>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 text-red-800 px-4 py-3 rounded-lg border border-red-200 mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm m-0">{error}</p>
          </div>
        )}

        {preferences && (
          <div className="space-y-4">
            {/* RICEZIONE DELLE COMUNICAZIONI */}
            <label className="flex items-start gap-4 p-5 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
              <input
                type="checkbox"
                checked={preferences.subscribed}
                onChange={(e) => save({ subscribed: e.target.checked })}
                disabled={isSaving}
                className="mt-1 w-5 h-5 accent-blue-600 cursor-pointer"
              />
              <span>
                <span className="block font-bold text-gray-900 mb-1">
                  Ricevere la newsletter
                </span>
                <span className="block text-sm text-gray-600">
                  Aggiornamenti, contenuti e comunicazioni promozionali.
                  Togliendo la spunta non riceverai più alcun messaggio.
                </span>
              </span>
            </label>

            {/* TRACCIAMENTO - REVOCABILE SEPARATAMENTE */}
            <label className="flex items-start gap-4 p-5 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
              <input
                type="checkbox"
                checked={preferences.trackingConsent}
                onChange={(e) => save({ trackingConsent: e.target.checked })}
                disabled={isSaving}
                className="mt-1 w-5 h-5 accent-blue-600 cursor-pointer"
              />
              <span>
                <span className="flex items-center gap-2 font-bold text-gray-900 mb-1">
                  <Eye className="w-4 h-4" />
                  Pixel di tracciamento
                </span>
                <span className="block text-sm text-gray-600">
                  Consentono a noi e ai nostri inserzionisti di rilevare
                  l'apertura dei messaggi, per misurare l'efficacia delle
                  campagne. Puoi disattivarli{" "}
                  <strong>continuando a ricevere la newsletter</strong>: i
                  messaggi ti arriveranno privi di questi marcatori e senza
                  alcuna altra limitazione.
                </span>
              </span>
            </label>

            {/* ESITO */}
            <div className="min-h-[28px] flex items-center justify-center">
              {isSaving && (
                <span className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvataggio in corso...
                </span>
              )}
              {saved && !isSaving && (
                <span className="flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  Preferenze salvate
                </span>
              )}
              {!saved && !isSaving && (
                <span className="flex items-center gap-2 text-sm text-gray-400">
                  <Save className="w-4 h-4" />
                  Le modifiche vengono salvate subito
                </span>
              )}
            </div>

            <p className="text-xs text-gray-500 text-center pt-2">
              Registriamo data e ora di ogni scelta per poterla dimostrare, come
              richiesto dall'art. 7 del GDPR. Maggiori informazioni nella{" "}
              <Link to="/privacy-policy" className="text-blue-600 underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        )}

        <div className="border-t border-gray-200 pt-6 mt-8 text-center">
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-700 font-medium hover:underline text-sm"
          >
            ← Torna alla Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
