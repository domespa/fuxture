import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import { useState } from "react";
import { X } from "lucide-react";

interface AwinBannerLinkAttrs {
  linkUrl: string;
  imageUrl: string;
  align: string;
}

const AwinBannerLinkComponent = ({
  node,
  updateAttributes,
  deleteNode,
}: NodeViewProps) => {
  const attrs = node.attrs as AwinBannerLinkAttrs;
  const { linkUrl, imageUrl, align = "left" } = attrs;
  const [showControls, setShowControls] = useState(false);

  const getAlignmentStyles = (): React.CSSProperties => {
    switch (align) {
      case "left":
        return { float: "left", marginRight: "20px", marginBottom: "10px" };
      case "right":
        return { float: "right", marginLeft: "20px", marginBottom: "10px" };
      case "center":
        return { margin: "20px auto", display: "block", textAlign: "center" };
      default:
        return { float: "left", marginRight: "20px", marginBottom: "10px" };
    }
  };

  return (
    <NodeViewWrapper
      as="span"
      className="awin-banner-link-wrapper"
      style={{
        display: "inline-block",
        position: "relative",
        ...getAlignmentStyles(),
      }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Pulsanti controllo */}
      {showControls && (
        <div
          style={{
            position: "absolute",
            top: "-35px",
            right: "0",
            background: "#1F2937",
            borderRadius: "8px",
            padding: "4px",
            display: "flex",
            gap: "4px",
            zIndex: 10,
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
          contentEditable={false}
        >
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const newAlign =
                align === "left"
                  ? "right"
                  : align === "right"
                    ? "center"
                    : "left";
              updateAttributes({ align: newAlign });
            }}
            style={{
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "6px 10px",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: "600",
            }}
            title="Cambia allineamento"
          >
            {align === "left" ? "⬅️" : align === "right" ? "➡️" : "⬆️"}
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (confirm("Rimuovere questo banner?")) {
                deleteNode();
              }
            }}
            style={{
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "4px",
              padding: "6px 10px",
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
            title="Rimuovi banner"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        contentEditable={false}
        style={{
          display: "block",
          border: showControls ? "2px solid #3b82f6" : "2px solid transparent",
          borderRadius: "8px",
          padding: "5px",
          background: "#fff",
          transition: "border-color 0.2s",
        }}
      >
        <img
          src={imageUrl}
          alt="Banner Awin"
          style={{
            maxWidth: "100%",
            height: "auto",
            display: "block",
          }}
          contentEditable={false}
        />
      </a>

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
        📢 Banner Awin - {align}
      </div>
    </NodeViewWrapper>
  );
};

export const AwinBannerLink = Node.create({
  name: "awinBannerLink",
  group: "inline",
  inline: true,
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      linkUrl: {
        default: "",
        parseHTML: (element) =>
          element.getAttribute("linkurl") ||
          element.getAttribute("data-link-url") ||
          "",
      },
      imageUrl: {
        default: "",
        parseHTML: (element) =>
          element.getAttribute("imageurl") ||
          element.getAttribute("data-image-url") ||
          "",
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
        tag: 'span[data-type="awin-banner-link"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-type": "awin-banner-link",
        linkurl: HTMLAttributes.linkUrl,
        imageurl: HTMLAttributes.imageUrl,
        align: HTMLAttributes.align,
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AwinBannerLinkComponent);
  },

  addCommands() {
    return {
      insertAwinBannerLink:
        (attrs: AwinBannerLinkAttrs) =>
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
    awinBannerLink: {
      insertAwinBannerLink: (attrs: AwinBannerLinkAttrs) => ReturnType;
    };
  }
}
