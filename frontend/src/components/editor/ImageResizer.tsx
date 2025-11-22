import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";

export const ImageResizer = ({ node, updateAttributes }: NodeViewProps) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: node.attrs.width || 0,
    height: node.attrs.height || 0,
  });
  const aspectRatio = useRef<number>(1);
  const isInitialized = useRef(false);

  useEffect(() => {
    const img = imageRef.current;
    if (!img || isInitialized.current) return;

    const handleLoad = () => {
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;
      aspectRatio.current = naturalWidth / naturalHeight;

      const savedWidth = node.attrs.width;
      const savedHeight = node.attrs.height;

      console.log("🔍 ImageResizer mounted with:", { savedWidth, savedHeight });

      if (savedWidth && savedHeight) {
        console.log("✅ Using saved dimensions:", { savedWidth, savedHeight });
        setDimensions({
          width: savedWidth,
          height: savedHeight,
        });
        aspectRatio.current = savedWidth / savedHeight;
      } else {
        console.log("⚠️ No saved dimensions, using default");
        const initialWidth = Math.min(naturalWidth, 800);
        const initialHeight = Math.round(initialWidth / aspectRatio.current);

        setDimensions({ width: initialWidth, height: initialHeight });
        updateAttributes({ width: initialWidth, height: initialHeight });
      }

      isInitialized.current = true;
    };

    if (img.complete) {
      handleLoad();
    } else {
      img.addEventListener("load", handleLoad);
      return () => img.removeEventListener("load", handleLoad);
    }
  }, [node.attrs.src]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);

    const startX = e.clientX;
    const startWidth = dimensions.width;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      let newWidth = startWidth + deltaX;

      const MIN_WIDTH = 50;
      const MAX_WIDTH = 2000;

      const maxWidth = Math.min(
        imageRef.current?.naturalWidth || MAX_WIDTH,
        MAX_WIDTH
      );

      newWidth = Math.max(MIN_WIDTH, Math.min(newWidth, maxWidth));
      const newHeight = Math.round(newWidth / aspectRatio.current);

      setDimensions({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);

      console.log("💾 Saving dimensions:", dimensions);

      updateAttributes({
        width: dimensions.width,
        height: dimensions.height,
      });

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // const handleImageClick = (e: React.MouseEvent) => {
  //   const link = node.attrs.link;
  //   if (link) {
  //     e.preventDefault();
  //     window.open(link, "_blank", "noopener,noreferrer");
  //   }
  // };

  const align = node.attrs.align || "left";
  const hasLink = !!node.attrs.link && node.attrs.link.trim() !== "";

  return (
    <NodeViewWrapper
      className={`image-node-wrapper align-${align}`}
      data-align={align}
    >
      <div className="image-container">
        <img
          ref={imageRef}
          src={node.attrs.src}
          alt={node.attrs.alt || ""}
          title={node.attrs.title || ""}
          style={{
            width: dimensions.width ? `${dimensions.width}px` : "auto",
            height: dimensions.height ? `${dimensions.height}px` : "auto",
            maxWidth: "100%",
            display: "block",
            cursor: hasLink ? "pointer" : "default",
          }}
          draggable={false}
          // onClick={handleImageClick}
        />

        {hasLink && (
          <div
            className="image-link-indicator"
            title={`Link a: ${node.attrs.link}`}
          >
            🔗
          </div>
        )}

        <div
          className="resize-handle"
          onMouseDown={handleMouseDown}
          title="Trascina per ridimensionare"
        />

        {isResizing && (
          <div className="resize-tooltip">
            {Math.round(dimensions.width)} × {Math.round(dimensions.height)}px
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};
