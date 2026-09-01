import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribersAPI } from "@/services/api";

interface GameNewsletterCtaProps {
  gameSlug: string;
  gameTitle: string;
}

// ====================================================================================================== //
//        Il gancio del progetto: chi ha appena giocato e il momento migliore per chiedere l email.
//        La source resta tracciata sul subscriber, cosi si vede quale gioco converte di piu.
// ====================================================================================================== //
export default function GameNewsletterCta({
  gameSlug,
  gameTitle,
}: GameNewsletterCtaProps) {
  const [email, setEmail] = useState("");
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Inserisci un indirizzo email valido");
      return;
    }

    if (!acceptedPrivacy) {
      setError("Devi accettare la Privacy Policy per iscriverti");
      return;
    }

    setIsLoading(true);

    try {
      await subscribersAPI.createSubscriber({
        email: email.trim(),
        source: `gioco-${gameSlug}`,
      });
      setIsDone(true);
      setEmail("");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Riprova tra qualche istante";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isDone) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-800">
        <CheckCircle2 className="h-5 w-5" />
        <span className="text-sm font-medium">
          Iscrizione registrata. Ti avvisiamo quando esce un nuovo gioco.
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Mail className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Ti e piaciuto {gameTitle}?
        </h3>
      </div>

      <p className="mb-4 text-sm text-gray-600">
        Lascia la tua email: ti scriviamo quando pubblichiamo un nuovo gioco o
        una nuova sfida. Niente spam, disiscrizione con un click.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="La tua email"
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Avvisami"
            )}
          </Button>
        </div>

        <label className="flex items-start gap-2 text-xs text-gray-500">
          <input
            type="checkbox"
            checked={acceptedPrivacy}
            onChange={(e) => setAcceptedPrivacy(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            Accetto la{" "}
            <Link to="/privacy-policy" className="text-blue-600 underline">
              Privacy Policy
            </Link>
          </span>
        </label>

        {error && <p className="text-xs text-red-600">{error}</p>}
      </form>
    </div>
  );
}
