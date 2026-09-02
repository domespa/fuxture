import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { isAxiosError } from "axios";
import { subscribersAPI } from "@/services/api";

export interface NewsletterFormProps {
  variant?: "footer" | "inline";
  // Da dove arriva l iscritto: si ritrova nella colonna source della dashboard
  source?: string;
}

export default function NewsletterForm({
  source = "newsletter-footer",
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset status
    setStatus("idle");
    setErrorMessage("");

    // Validazione frontend
    if (!email.trim()) {
      setStatus("error");
      setErrorMessage("Inserisci un indirizzo email valido");
      return;
    }

    if (!acceptedPrivacy) {
      setStatus("error");
      setErrorMessage("Devi accettare la Privacy Policy per iscriverti");
      return;
    }

    setIsLoading(true);

    try {
      await subscribersAPI.createSubscriber({
        email: email.trim(),
        name: name.trim() || undefined,
        source,
      });

      // Successo!
      setStatus("success");
      setEmail("");
      setName("");
      setAcceptedPrivacy(false);

      // Reset messaggio successo dopo 5 secondi
      setTimeout(() => {
        setStatus("idle");
      }, 5000);
    } catch (error) {
      setStatus("error");

      // 409 = email già iscritta: non è un errore, è una buona notizia
      if (isAxiosError(error) && error.response?.status === 409) {
        setErrorMessage(
          error.response.data?.error ||
            "Questa email è già iscritta alla newsletter"
        );
      } else if (isAxiosError(error) && error.response?.data?.error) {
        setErrorMessage(error.response.data.error);
      } else if (isAxiosError(error) && !error.response) {
        setErrorMessage(
          "Server non raggiungibile. Controlla la connessione e riprova."
        );
      } else {
        setErrorMessage("Si è verificato un errore. Riprova più tardi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Success State
  if (status === "success") {
    return (
      <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6 text-center animate-fade-in">
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-green-900 mb-2">
          🎉 Iscrizione Completata!
        </h3>
        <p className="text-green-700 text-sm">
          Controlla la tua email per confermare l'iscrizione alla newsletter.
        </p>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="La tua email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            required
            disabled={isLoading}
            aria-label="Email per newsletter"
          />

          {/* Nome Input  */}
          <input
            type="text"
            placeholder="Nome (facoltativo)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            disabled={isLoading}
            maxLength={100}
            aria-label="Nome (facoltativo)"
          />
        </div>

        {/* Privacy Checkbox */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="privacy-checkbox"
            checked={acceptedPrivacy}
            onChange={(e) => setAcceptedPrivacy(e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
            required
            disabled={isLoading}
          />
          <label
            htmlFor="privacy-checkbox"
            className="text-sm text-gray-400 cursor-pointer"
          >
            Ho letto e accetto la{" "}
            <Link
              to="/privacy-policy"
              className="text-blue-400 hover:text-blue-300 underline font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </Link>{" "}
            e acconsento al trattamento dei miei dati personali per ricevere la
            newsletter. *
          </label>
        </div>

        {/* Error Message */}
        {status === "error" && (
          <div className="flex items-center gap-2 bg-red-50 text-red-800 px-4 py-3 rounded-lg border border-red-200 animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !acceptedPrivacy}
          className="mx-auto w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 min-w-[140px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Invio...
            </>
          ) : (
            <>
              <Mail className="w-5 h-5" />
              Iscriviti
            </>
          )}
        </button>

        {/* Disclaimer sotto il form */}
        <p className="text-xs text-gray-500 mt-3">
          * Campi obbligatori. Puoi disiscriverti in qualsiasi momento cliccando
          il link in fondo a ogni email.
        </p>
      </form>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
