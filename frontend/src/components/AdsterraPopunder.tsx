import { useEffect } from "react";
import { hasMarketingConsent } from "@/lib/consent";

// Non montato da nessuna parte al momento. Se verra' riattivato, lo script
// parte solo dopo un "Accetta tutti" esplicito: e' pubblicita' di terze parti
// con profilazione, e il banner cookie dichiara che senza consenso non ne
// viene installata.
const AdsterraPopunder = () => {
  useEffect(() => {
    if (!hasMarketingConsent()) return;

    const script = document.createElement("script");
    script.src =
      "https://pl28791758.effectivegatecpm.com/e5/94/ad/e594ad1efb9cbd58cb7f3eb62ace24d1.js";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // remove() al posto di removeChild(): se qualcosa ha gia' spostato o
      // rimosso il nodo, removeChild solleva e rompe lo smontaggio del
      // componente.
      script.remove();
    };
  }, []);

  return null;
};

export default AdsterraPopunder;
