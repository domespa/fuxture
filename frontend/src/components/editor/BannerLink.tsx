import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";

interface AwinBannerLinkAttrs {
  linkUrl: string;
  imageUrl: string;
  align: string;
}

const AwinBannerLinkComponent = ({ node }: NodeViewProps) => {
  const attrs = node.attrs as AwinBannerLinkAttrs;
  const { linkUrl, imageUrl, align = "left" } = attrs;

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
      as="div"
      className="awin-banner-link-wrapper"
      style={{
        display: "inline-block",
        ...getAlignmentStyles(),
      }}
    >
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        contentEditable={false}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        style={{
          display: "block",
          border: "2px solid #3b82f6",
          borderRadius: "8px",
          padding: "5px",
          background: "#fff",
          cursor: "pointer",
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
      setAwinBannerLinkAlign:
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
    awinBannerLink: {
      insertAwinBannerLink: (attrs: AwinBannerLinkAttrs) => ReturnType;
      setAwinBannerLinkAlign: (align: string) => ReturnType;
    };
  }
}
