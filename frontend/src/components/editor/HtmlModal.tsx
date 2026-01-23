import { useState, useEffect, useRef } from "react";
import { X, Eye, EyeOff } from "lucide-react";

interface HtmlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (html: string) => void;
}

// Helper per parsare codice Awin - VERSIONE CORRETTA
const parseAwinCode = (html: string) => {
  const scriptMatch = html.match(/src="([^"]+awin1\.com[^"]+)"/);
  const iframeMatch = html.match(/iframe[^>]+src="([^"]+)"/);
  const widthMatch = html.match(/width="(\d+)"/);
  const heightMatch = html.match(/height="(\d+)"/);

  if (scriptMatch) {
    return {
      isAwin: true,
      scriptUrl: scriptMatch[1],
      iframeUrl: iframeMatch ? iframeMatch[1] : `${scriptMatch[1]}&iframe=1`,
      width: widthMatch ? widthMatch[1] : "1080",
      height: heightMatch ? heightMatch[1] : "1920",
    };
  }

  return {
    isAwin: false,
    scriptUrl: "",
    iframeUrl: "",
    width: "1080",
    height: "1920",
  };
};

// Componente per anteprima con script eseguibili
const HtmlPreview = ({ html }: { html: string }) => {
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("🔍 HtmlPreview - HTML ricevuto:", html);

    if (!previewRef.current || !html) return;

    const awinData = parseAwinCode(html);
    console.log("🔍 Awin Data parsed:", awinData);

    if (awinData.isAwin && awinData.scriptUrl) {
      console.log("✅ È un banner Awin, mostro iframe...");

      previewRef.current.innerHTML = "";

      // Per l'anteprima usiamo direttamente l'iframe
      const iframe = document.createElement("iframe");
      iframe.src = awinData.iframeUrl;
      iframe.width = awinData.width;
      iframe.height = awinData.height;
      iframe.style.border = "none";
      iframe.style.maxWidth = "100%";

      previewRef.current.appendChild(iframe);
      console.log("✅ Iframe aggiunto al DOM");
    } else {
      console.log("📄 HTML normale, uso innerHTML");
      previewRef.current.innerHTML = html;
    }

    return () => {
      if (previewRef.current) {
        previewRef.current.innerHTML = "";
      }
    };
  }, [html]);

  return (
    <div
      ref={previewRef}
      className="html-preview"
      style={{ minHeight: "100px", background: "#fff" }}
    />
  );
};

export const HtmlModal = ({ isOpen, onClose, onInsert }: HtmlModalProps) => {
  const [htmlCode, setHtmlCode] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const handleInsert = () => {
    if (htmlCode.trim()) {
      const awinData = parseAwinCode(htmlCode);

      if (awinData.isAwin) {
        // È un banner Awin, usa il nodo custom
        onInsert(
          JSON.stringify({
            type: "awinBanner",
            attrs: {
              scriptUrl: awinData.scriptUrl,
              iframeUrl: awinData.iframeUrl,
              width: awinData.width,
              height: awinData.height,
            },
          }),
        );
      } else {
        // HTML normale
        onInsert(htmlCode);
      }

      setHtmlCode("");
      setShowPreview(false);
      onClose();
    }
  };

  const handleClose = () => {
    setHtmlCode("");
    setShowPreview(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              📝 Inserisci Codice HTML
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Incolla banner pubblicitari, widget o qualsiasi codice HTML
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-4">
            {/* Textarea per HTML */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Codice HTML
              </label>
              <textarea
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                placeholder='<div class="banner">
  <h3>Il tuo banner qui</h3>
  <p>Testo del banner...</p>
</div>

<!-- oppure -->

<iframe src="https://..." width="100%" height="400"></iframe>

<!-- oppure codice AdSense, widget social, ecc. -->'
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm bg-gray-50 resize-none"
                autoFocus
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">
                  {htmlCode.length} caratteri
                </p>
                {htmlCode && (
                  <button
                    type="button"
                    onClick={() => setHtmlCode("")}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Cancella tutto
                  </button>
                )}
              </div>
            </div>

            {/* Toggle Preview */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
              >
                {showPreview ? (
                  <>
                    <EyeOff size={16} />
                    Nascondi anteprima
                  </>
                ) : (
                  <>
                    <Eye size={16} />
                    Mostra anteprima
                  </>
                )}
              </button>
              {htmlCode && (
                <span className="text-xs text-gray-500">
                  Verifica che il codice sia corretto prima di inserirlo
                </span>
              )}
            </div>

            {/* Preview con script eseguibili */}
            {showPreview && htmlCode && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Anteprima Live
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 min-h-[100px]">
                  <HtmlPreview html={htmlCode} />
                </div>
                <p className="text-xs text-gray-500 mt-3 italic">
                  ⚠️ Assicurati che il codice sia sicuro e provenga da fonti
                  affidabili
                </p>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">
                💡 Esempi di utilizzo:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  • Banner pubblicitari (Google AdSense, Awin, banner custom)
                </li>
                <li>• Widget social (Twitter, Instagram, Facebook)</li>
                <li>• Video embed (YouTube, Vimeo)</li>
                <li>• Iframe personalizzati</li>
                <li>• Componenti HTML/CSS custom</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={handleInsert}
            disabled={!htmlCode.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
          >
            <span>✓</span>
            Inserisci HTML
          </button>
        </div>
      </div>
    </div>
  );
};
