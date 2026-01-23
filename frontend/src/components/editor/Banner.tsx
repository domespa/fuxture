// components/editor/AwinBannerNode.tsx
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import { useEffect, useRef } from "react";

interface AwinBannerAttrs {
  scriptUrl: string;
  iframeUrl: string;
  width: string;
  height: string;
  align: string; // ← AGGIUNTO
}

const AwinBannerComponent = ({ node, updateAttributes }: NodeViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const attrs = node.attrs as AwinBannerAttrs;
  const { scriptUrl, iframeUrl, width, height, align = "left" } = attrs;

  useEffect(() => {
    if (!containerRef.current || !iframeUrl) return;

    containerRef.current.innerHTML = "";

    const iframe = document.createElement("iframe");
    iframe.src = iframeUrl;
    iframe.width = width || "300";
    iframe.height = height || "600";
    iframe.style.border = "none";
    iframe.style.display = "block";
    iframe.style.maxWidth = "100%";

    containerRef.current.appendChild(iframe);
  }, [scriptUrl, iframeUrl, width, height]);

  // Stili in base all'allineamento
  const getAlignmentStyles = () => {
    switch (align) {
      case "left":
        return {
          float: "left" as const,
          marginRight: "20px",
          marginBottom: "10px",
        };
      case "right":
        return {
          float: "right" as const,
          marginLeft: "20px",
          marginBottom: "10px",
        };
      case "center":
        return { margin: "20px auto", display: "block" };
      default:
        return {
          float: "left" as const,
          marginRight: "20px",
          marginBottom: "10px",
        };
    }
  };

  return (
    <NodeViewWrapper
      as="span"
      className="awin-banner-wrapper"
      style={{
        display: "inline-block",
        ...getAlignmentStyles(),
      }}
    >
      <div
        ref={containerRef}
        className="awin-banner-container"
        style={{
          position: "relative",
          border: "2px solid #3b82f6",
          borderRadius: "8px",
          padding: "10px",
          background: "#fff",
          cursor: "pointer",
        }}
        contentEditable={false}
        onClick={(e) => {
          e.stopPropagation();
          // Cambia allineamento al click
          const newAlign =
            align === "left" ? "right" : align === "right" ? "center" : "left";
          updateAttributes({ align: newAlign });
        }}
      />
      <div
        style={{
          fontSize: "10px",
          color: "#3b82f6",
          marginTop: "4px",
          textAlign: "center",
          fontWeight: "600",
          background: "#eff6ff",
          padding: "2px 6px",
          borderRadius: "4px",
        }}
        contentEditable={false}
      >
        📢 Banner Awin ({width}x{height}) - {align}
      </div>
    </NodeViewWrapper>
  );
};

export const AwinBanner = Node.create({
  name: "awinBanner",
  group: "inline", // ← CAMBIATO da "block" a "inline"
  inline: true, // ← AGGIUNTO
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      scriptUrl: {
        default: "",
        parseHTML: (element) =>
          element.getAttribute("scripturl") ||
          element.getAttribute("data-script-url") ||
          "",
      },
      iframeUrl: {
        default: "",
        parseHTML: (element) =>
          element.getAttribute("iframeurl") ||
          element.getAttribute("data-iframe-url") ||
          "",
      },
      width: {
        default: "300",
        parseHTML: (element) => element.getAttribute("width") || "300",
      },
      height: {
        default: "600",
        parseHTML: (element) => element.getAttribute("height") || "600",
      },
      align: {
        default: "left",
        parseHTML: (element) =>
          element.getAttribute("align") ||
          element.getAttribute("data-align") ||
          "left",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="awin-banner"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-type": "awin-banner",
        scripturl: HTMLAttributes.scriptUrl,
        iframeurl: HTMLAttributes.iframeUrl,
        width: HTMLAttributes.width,
        height: HTMLAttributes.height,
        align: HTMLAttributes.align,
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AwinBannerComponent);
  },

  addCommands() {
    return {
      insertAwinBanner:
        (attrs: AwinBannerAttrs) =>
        ({ commands }: any) => {
          return commands.insertContent({
            type: this.name,
            attrs: { ...attrs, align: attrs.align || "left" },
          });
        },
    };
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    awinBanner: {
      insertAwinBanner: (attrs: AwinBannerAttrs) => ReturnType;
    };
  }
}
