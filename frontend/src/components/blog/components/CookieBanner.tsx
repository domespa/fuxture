import { useState, useEffect } from "react";
import { X, Cookie } from "lucide-react";
import { Link } from "react-router-dom";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Controlla se l'utente ha già accettato i cookie
    const cookieConsent = localStorage.getItem("cookieConsent");
    if (!cookieConsent) {
      setShowBanner(true);
    }
  }, []);

  const acceptAllCookies = () => {
    localStorage.setItem("cookieConsent", "all");
    setShowBanner(false);
    // Qui attiveresti Google Analytics, Facebook Pixel, etc.
    console.log("Tutti i cookie accettati");
  };

  const acceptOnlyNecessary = () => {
    localStorage.setItem("cookieConsent", "necessary");
    setShowBanner(false);
    console.log("Solo cookie necessari");
  };

  const closeBanner = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-200 shadow-2xl animate-slide-up">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 mt-1">
            <Cookie className="w-8 h-8 text-blue-600" />
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Utilizziamo i Cookie
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Questo sito utilizza solo strumenti tecnici necessari al suo
              funzionamento e <strong>non</strong> installa cookie di
              profilazione o di terze parti. La tua scelta viene salvata sul
              dispositivo e varrà anche per gli eventuali servizi che
              introdurremo in futuro. Per maggiori informazioni consulta la
              nostra{" "}
              <Link
                to="/cookie-policy"
                className="text-blue-600 hover:underline font-medium"
              >
                Cookie Policy
              </Link>{" "}
              e la{" "}
              <Link
                to="/privacy-policy"
                className="text-blue-600 hover:underline font-medium"
              >
                Privacy Policy
              </Link>
              .
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={acceptAllCookies}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Accetta tutti
              </button>
              <button
                onClick={acceptOnlyNecessary}
                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
              >
                Solo necessari
              </button>
              <Link
                to="/cookie-policy"
                className="px-6 py-2.5 text-center border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-colors"
              >
                Personalizza
              </Link>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={closeBanner}
            className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Chiudi banner cookie"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
