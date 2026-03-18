import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Mail, CheckCircle, AlertCircle, Loader2, Info } from "lucide-react";

type Status = "loading" | "success" | "already" | "error";

export default function UnsubscribePage() {
  const { subscriberId } = useParams<{ subscriberId: string }>();
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    window.scrollTo(0, 0);

    const doUnsubscribe = async () => {
      if (!subscriberId) {
        setStatus("error");
        return;
      }

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/subscribers/unsubscribe/${subscriberId}`,
        );
        const data = await res.json();

        if (res.ok && data.success) {
          if (data.message.toLowerCase().includes("già")) {
            setStatus("already");
          } else {
            setStatus("success");
          }
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    };

    doUnsubscribe();
  }, [subscriberId]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Mail className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Newsletter</h1>
          <p className="text-gray-600 text-lg">
            Gestione iscrizione alla newsletter di Fuxture
          </p>
        </div>

        {/* Loading */}
        {status === "loading" && (
          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8 rounded-lg">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin flex-shrink-0" />
              <div>
                <h3 className="font-bold text-blue-900 mb-1">
                  Elaborazione in corso...
                </h3>
                <p className="text-blue-800 text-sm">
                  Stiamo processando la tua richiesta di disiscrizione.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success */}
        {status === "success" && (
          <div className="bg-green-50 border-l-4 border-green-600 p-6 mb-8 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-green-900 mb-2">
                  Disiscrizione completata ✅
                </h3>
                <p className="text-green-800 text-sm">
                  Hai cancellato con successo la tua iscrizione alla newsletter.
                  Non riceverai più email da parte nostra.
                </p>
                <p className="text-green-700 text-sm mt-2">
                  Ti abbiamo inviato un'email di conferma. Ci dispiace vederti
                  andare!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Already unsubscribed */}
        {status === "already" && (
          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-blue-900 mb-2">
                  Già disiscritto ℹ️
                </h3>
                <p className="text-blue-800 text-sm">
                  Questa email risulta già rimossa dalla nostra newsletter. Non
                  hai nulla da fare.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="bg-red-50 border-l-4 border-red-600 p-6 mb-8 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-900 mb-2">Errore ❌</h3>
                <p className="text-red-800 text-sm">
                  Il link potrebbe essere non valido o scaduto. Se il problema
                  persiste, contattaci direttamente.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Info box */}
        {(status === "success" || status === "already") && (
          <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-600 mb-8">
            <h3 className="font-bold text-gray-900 mb-2">
              Vuoi iscriverti di nuovo?
            </h3>
            <p className="text-gray-700 text-sm">
              Puoi tornare a iscriverti in qualsiasi momento dalla nostra
              homepage.
            </p>
            <Link
              to="/"
              className="inline-block mt-3 bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-purple-700 transition-colors"
            >
              Torna alla Homepage
            </Link>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="border-t border-gray-200 pt-8 mt-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              ← Torna alla Homepage
            </Link>
            <div className="flex gap-4 flex-wrap justify-center">
              <Link
                to="/privacy-policy"
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Privacy Policy
              </Link>
              <Link
                to="/contact"
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                Contattaci
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
