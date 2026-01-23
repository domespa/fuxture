import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import { useEffect, useRef } from "react";

interface AwinBannerAttrs {
  scriptUrl: string;
  iframeUrl: string;
  width: string;
  height: string;
}

const AwinBannerComponent = ({ node }: NodeViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const attrs = node.attrs as AwinBannerAttrs;
  const { scriptUrl, iframeUrl, width, height } = attrs;

  console.log("🔍 AwinBannerComponent mounted:", attrs);

  useEffect(() => {
    if (!containerRef.current || !iframeUrl) {
      console.log("❌ Container o iframeUrl mancante");
      return;
    }

    console.log("✅ Rendering Awin banner iframe...");

    containerRef.current.innerHTML = "";

    // Usa direttamente l'iframe per visualizzare il banner
    const iframe = document.createElement("iframe");
    iframe.src = iframeUrl;
    iframe.width = width || "627";
    iframe.height = height || "627";
    iframe.style.border = "none";
    iframe.style.maxWidth = "100%";
    iframe.style.display = "block";

    containerRef.current.appendChild(iframe);
    console.log("✅ Iframe aggiunto:", iframeUrl);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [scriptUrl, iframeUrl, width, height]);

  return (
    <NodeViewWrapper className="awin-banner-wrapper">
      <div
        ref={containerRef}
        className="awin-banner-container"
        style={{
          minHeight: "200px",
          border: "2px dashed #3b82f6",
          borderRadius: "8px",
          padding: "20px",
          margin: "20px 0",
          background: "#eff6ff",
          position: "relative",
        }}
        contentEditable={false}
      />
      <div
        style={{
          fontSize: "12px",
          color: "#3b82f6",
          marginTop: "8px",
          textAlign: "center",
          fontWeight: "600",
        }}
        contentEditable={false}
      >
        📢 Banner Awin ({width}x{height})
      </div>
    </NodeViewWrapper>
  );
};

export const AwinBanner = Node.create({
  name: "awinBanner",
  group: "block",
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
        default: "627",
        parseHTML: (element) => element.getAttribute("width") || "627",
      },
      height: {
        default: "627",
        parseHTML: (element) => element.getAttribute("height") || "627",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="awin-banner"]',
        getAttrs: (dom) => {
          if (typeof dom === "string") return false;
          const element = dom as HTMLElement;

          console.log("🔍 Parsing Awin banner:", {
            scriptUrl:
              element.getAttribute("scripturl") ||
              element.getAttribute("data-script-url"),
            iframeUrl:
              element.getAttribute("iframeurl") ||
              element.getAttribute("data-iframe-url"),
            width: element.getAttribute("width"),
            height: element.getAttribute("height"),
          });

          return {};
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    console.log("🔍 renderHTML Awin:", HTMLAttributes);
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "awin-banner",
        scripturl: HTMLAttributes.scriptUrl,
        iframeurl: HTMLAttributes.iframeUrl,
        width: HTMLAttributes.width,
        height: HTMLAttributes.height,
      }),
      "Banner Awin",
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
          console.log("🔍 insertAwinBanner command:", attrs);
          return commands.insertContent({
            type: this.name,
            attrs,
          });
        },
    };
  },
});

// Estendi i tipi per TypeScript
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    awinBanner: {
      insertAwinBanner: (attrs: AwinBannerAttrs) => ReturnType;
    };
  }
}
