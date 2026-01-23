// components/AwinBannerRenderer.tsx
import { useEffect, useRef } from "react";

interface AwinBannerRendererProps {
  scriptUrl: string;
  iframeUrl: string;
  width: string;
  height: string;
  align?: string;
}

export const AwinBannerRenderer = ({
  scriptUrl,
  iframeUrl,
  width,
  height,
  align = "left",
}: AwinBannerRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !scriptUrl) return;

    // Pulisci il contenuto precedente
    containerRef.current.innerHTML = "";

    // Crea e inserisci lo script Awin
    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    containerRef.current.appendChild(script);

    // Fallback noscript con iframe
    const noscript = document.createElement("noscript");
    const iframe = document.createElement("iframe");
    iframe.src = iframeUrl;
    iframe.width = width;
    iframe.height = height;
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("scrolling", "no");
    iframe.style.border = "0";
    noscript.appendChild(iframe);
    containerRef.current.appendChild(noscript);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [scriptUrl, iframeUrl, width, height]);

  const getAlignmentStyles = (): React.CSSProperties => {
    switch (align) {
      case "left":
        return { float: "left", marginRight: "20px", marginBottom: "10px" };
      case "right":
        return { float: "right", marginLeft: "20px", marginBottom: "10px" };
      case "center":
        return { margin: "20px auto", display: "block" };
      default:
        return { float: "left", marginRight: "20px", marginBottom: "10px" };
    }
  };

  return (
    <div
      ref={containerRef}
      className="awin-banner-public"
      style={{
        display: "inline-block",
        maxWidth: "100%",
        ...getAlignmentStyles(),
      }}
    />
  );
};
