import { useEffect, useRef } from "react";
import { hasMarketingConsent } from "@/lib/consent";

// Non montato da nessuna parte al momento. Vale la stessa nota di
// AdsterraPopunder: niente script senza consenso esplicito.
const AdsterraBanner = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;

    if (!container || !hasMarketingConsent()) return;

    const scriptOptions = document.createElement("script");
    scriptOptions.innerHTML = `
    atOptions = {
      'key' : '9f3da66dbdc5ebcc0e0c54ca516a4b33',
      'format' : 'iframe',
      'height' : 250,
      'width' : 300,
      'params' : {}
    };
  `;

    const scriptInvoke = document.createElement("script");
    scriptInvoke.src =
      "https://www.highperformanceformat.com/9f3da66dbdc5ebcc0e0c54ca516a4b33/invoke.js";
    scriptInvoke.async = true;

    container.appendChild(scriptOptions);
    container.appendChild(scriptInvoke);

    // Mancava del tutto: in StrictMode l'effetto gira due volte e il banner
    // veniva inserito in doppio, e a ogni rimontaggio si accumulavano script.
    // Il nodo si legge in una variabile perche' al momento della pulizia
    // ref.current puo' gia' essere null.
    return () => {
      container.innerHTML = "";
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{ width: "300px", height: "250px", margin: "20px auto" }}
    />
  );
};

export default AdsterraBanner;
