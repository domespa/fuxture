import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";

interface AwinBannerAttrs {
  scriptUrl: string;
  iframeUrl: string;
  width: string;
  height: string;
  align: string;
}

const getAlignmentStyles = (align: string): CSSProperties => {
  switch (align) {
    case "float-left":
      return { float: "left", margin: "0.5rem 2rem 1rem 0", maxWidth: "50%" };
    case "float-right":
      return { float: "right", margin: "0.5rem 0 1rem 2rem", maxWidth: "50%" };
    case "right":
      return { display: "block", marginLeft: "auto", marginRight: "0" };
    case "center":
      return { display: "block", margin: "0 auto" };
    default:
      return { display: "block", marginLeft: "0", marginRight: "auto" };
  }
};

const AwinBannerComponent = ({ node }: NodeViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const attrs = node.attrs as AwinBannerAttrs;
  const { iframeUrl, width, height, align = "left" } = attrs;

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
  }, [iframeUrl, width, height]);

  return (
    <NodeViewWrapper
      as="div"
      className="awin-banner-wrapper"
      style={getAlignmentStyles(align)}
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
        }}
        contentEditable={false}
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
  group: "block",
  inline: false,
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
      setAwinBannerAlign:
        (align: string) =>
        ({ commands, state }: any) => {
          const { selection } = state;
          const node = state.doc.nodeAt(selection.from);
          if (node && node.type.name === this.name) {
            return commands.updateAttributes(this.name, { align });
          }
          return false;
        },
    };
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    awinBanner: {
      insertAwinBanner: (attrs: AwinBannerAttrs) => ReturnType;
      setAwinBannerAlign: (align: string) => ReturnType;
    };
  }
}
