import { useEffect, useRef, useState } from "react";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";

export const ImageResizer = ({ node, updateAttributes }: NodeViewProps) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [currentWidth, setCurrentWidth] = useState<number>(0);
  const [currentHeight, setCurrentHeight] = useState<number>(0);
  const aspectRatio = useRef<number>(1);

  // Inizializza dimensioni al caricamento immagine
  useEffect(() => {
    const img = imageRef.current;
    if (!img) return;

    const handleLoad = () => {
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;
      aspectRatio.current = naturalWidth / naturalHeight;

      // Se non ci sono dimensioni salvate, usa quelle naturali (max 800px width)
      if (!node.attrs.width) {
        const initialWidth = Math.min(naturalWidth, 800);
        const initialHeight = Math.round(initialWidth / aspectRatio.current);

        setCurrentWidth(initialWidth);
        setCurrentHeight(initialHeight);

        updateAttributes({
          width: initialWidth,
          height: initialHeight,
        });
      } else {
        // Usa dimensioni salvate
        setCurrentWidth(node.attrs.width);
        setCurrentHeight(node.attrs.height);
        aspectRatio.current = node.attrs.width / node.attrs.height;
      }
    };

    if (img.complete) {
      handleLoad();
    } else {
      img.addEventListener("load", handleLoad);
      return () => img.removeEventListener("load", handleLoad);
    }
  }, [node.attrs.src]);

  // Aggiorna il componente quando cambiano gli attributi (incluso align)
  useEffect(() => {
    // Force re-render quando cambia l'allineamento
  }, [node.attrs.align, node.attrs.width, node.attrs.height]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);

    const startX = e.clientX;
    const startWidth = currentWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      // Calcola la differenza dal punto di partenza
      const deltaX = moveEvent.clientX - startX;

      // Nuova larghezza = larghezza iniziale + movimento mouse
      let newWidth = startWidth + deltaX;

      // Limiti: min 100px, max 1200px (o max larghezza naturale)
      const maxWidth = Math.min(imageRef.current?.naturalWidth || 1200, 1200);
      newWidth = Math.max(100, Math.min(newWidth, maxWidth));

      // Calcola altezza proporzionale
      const newHeight = Math.round(newWidth / aspectRatio.current);

      // Aggiorna SOLO lo state locale (per fluidità)
      setCurrentWidth(newWidth);
      setCurrentHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);

      // Solo ALLA FINE salva nel node (evita troppi update)
      updateAttributes({
        width: currentWidth,
        height: currentHeight,
      });

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <NodeViewWrapper
      ref={containerRef}
      className={`img-wrapper img-align-${node.attrs.align || "left"}`}
      data-align={node.attrs.align || "left"}
      style={{
        maxWidth: "100%",
      }}
    >
      {/* Wrapper per gestire hover e selezione */}
      <div className="relative inline-block">
        <img
          ref={imageRef}
          src={node.attrs.src}
          alt={node.attrs.alt || ""}
          title={node.attrs.title || ""}
          className="block rounded-lg transition-shadow duration-200"
          style={{
            width: currentWidth ? `${currentWidth}px` : "auto",
            height: currentHeight ? `${currentHeight}px` : "auto",
            maxWidth: "100%",
            cursor: "default",
          }}
          draggable={false}
        />

        {/* Resize Handle - Visibile solo on hover */}
        <div
          onMouseDown={handleMouseDown}
          className="absolute bottom-0 right-0 w-5 h-5 bg-blue-500 border-2 border-white rounded-full cursor-nwse-resize hidden group-hover:block transition-all shadow-lg hover:scale-110"
          style={{ transform: "translate(30%, 30%)" }}
          title="Trascina per ridimensionare"
        />

        {/* Border quando hover (feedback visivo) */}
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-400 rounded-lg pointer-events-none transition-colors duration-200" />
      </div>

      {/* Tooltip dimensioni durante resize */}
      {isResizing && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap shadow-lg z-10">
          {Math.round(currentWidth)} × {Math.round(currentHeight)}px
        </div>
      )}
    </NodeViewWrapper>
  );
};
