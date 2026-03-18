import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function UnsubscribePage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Inserisci la tua email");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email non valida");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/subscribers/unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // Mostriamo sempre successo, anche se l'email non esiste
      setSubmitted(true);
    } catch {
      setError("Errore di connessione. Riprova più tardi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8 md:p-12">
        {/* Header */}
        <div className="text-center mb-10">
          <Mail className="w-14 h-14 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Annulla iscrizione
          </h1>
          <p className="text-gray-600">
            Inserisci la tua email per cancellarti dalla newsletter di Fuxture.
          </p>
        </div>

        {/* Successo */}
        {submitted ? (
          <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-green-900 mb-1">
                  Richiesta ricevuta ✅
                </h3>
                <p className="text-green-800 text-sm">
                  La tua richiesta di cancellazione è stata registrata. Verrai
                  rimosso dalla newsletter entro <strong>48 ore</strong>.
                </p>
              </div>
            </div>
            <Link
              to="/"
              className="inline-block mt-4 text-blue-600 hover:underline text-sm font-medium"
            >
              ← Torna alla Homepage
            </Link>
          </div>
        ) : (
          /* Form */
          <div className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-gray-700 mb-2"
              >
                <Mail className="w-4 h-4 inline mr-1" />
                La tua email *
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  error ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
                placeholder="tuaemail@esempio.com"
                disabled={isSubmitting}
              />
              {error && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white px-8 py-3 rounded-lg font-bold text-base hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Invio in corso...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Cancella iscrizione
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              Riceverai una conferma via email entro 48 ore.
            </p>
          </div>
        )}

        {/* Footer */}
        {!submitted && (
          <div className="border-t border-gray-200 pt-6 mt-8 text-center">
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline text-sm"
            >
              ← Torna alla Homepage
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
