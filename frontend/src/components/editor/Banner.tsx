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

  useEffect(() => {
    if (!containerRef.current || !scriptUrl) return;

    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    containerRef.current.appendChild(script);

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

  return (
    <NodeViewWrapper>
      <div className="awin-banner-wrapper" contentEditable={false}>
        <div
          ref={containerRef}
          className="awin-banner-container"
          style={{
            minHeight: "200px",
            border: "2px dashed #e5e7eb",
            padding: "20px",
            margin: "20px 0",
            background: "#f9fafb",
            borderRadius: "8px",
          }}
        />
        <div
          style={{
            fontSize: "12px",
            color: "#6b7280",
            marginTop: "8px",
            textAlign: "center",
          }}
        >
          📢 Banner Pubblicitario
        </div>
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
      },
      iframeUrl: {
        default: "",
      },
      width: {
        default: "1080",
      },
      height: {
        default: "1920",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="awin-banner"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "awin-banner",
        "data-script-url": HTMLAttributes.scriptUrl,
        "data-iframe-url": HTMLAttributes.iframeUrl,
      }),
      "Banner",
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
