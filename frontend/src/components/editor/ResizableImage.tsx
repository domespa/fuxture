import Image from "@tiptap/extension-image";
import { mergeAttributes } from "@tiptap/core";

export interface ResizableImageOptions {
  inline?: boolean;
  allowBase64?: boolean;
  HTMLAttributes?: Record<string, any>;
}

export interface SetImageOptions {
  src: string;
  alt?: string;
  title?: string;
  width?: number;
  height?: number;
  align?: string;
  link?: string | null;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    resizableImage: {
      setImage: (options: SetImageOptions) => ReturnType;
      setImageAlign: (
        align: "left" | "center" | "right" | "float-left" | "float-right"
      ) => ReturnType;
      removeImageLink: () => ReturnType;
    };
  }
}

export const ResizableImage = Image.extend<ResizableImageOptions>({
  name: "resizableImage",

  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
        parseHTML: (element) => {
          const width = element.getAttribute("width");
          const parsed = width ? parseInt(width, 10) : null;
          console.log("🔍 PARSE width:", width, "→", parsed);
          return parsed;
        },
        renderHTML: (attributes) => {
          const width = attributes.width;
          console.log("🔍 RENDER width:", width, typeof width);

          if (width && typeof width === "number" && width > 0) {
            return {
              width: String(width),
            };
          }

          return {};
        },
      },
      height: {
        default: null,
        parseHTML: (element) => {
          const height = element.getAttribute("height");
          const parsed = height ? parseInt(height, 10) : null;
          console.log("🔍 PARSE height:", height, "→", parsed);
          return parsed;
        },
        renderHTML: (attributes) => {
          const height = attributes.height;
          console.log("🔍 RENDER height:", height, typeof height);

          if (height && typeof height === "number" && height > 0) {
            return {
              height: String(height),
            };
          }

          return {};
        },
      },
      align: {
        default: "left",
        parseHTML: (element) => {
          const align = element.getAttribute("data-align") || "left";
          console.log("🔍 PARSE align:", align);
          return align;
        },
        renderHTML: (attributes) => {
          const align = attributes.align || "left";
          console.log("🔍 RENDER align:", align);
          return {
            "data-align": align,
          };
        },
      },
      link: {
        default: null,
        parseHTML: (element) => {
          const link = element.getAttribute("data-link");
          console.log("🔍 PARSE link:", link);
          return link || null;
        },
        renderHTML: (attributes) => {
          const link = attributes.link;
          if (link && link.trim() !== "") {
            // ✅ Controlla che non sia vuoto
            console.log("🔍 RENDER link:", link);
            return {
              "data-link": link,
            };
          }
          return {};
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "img[src]",
        getAttrs: (element) => {
          if (typeof element === "string") return false;

          const attrs = {
            src: element.getAttribute("src"),
            alt: element.getAttribute("alt"),
            title: element.getAttribute("title"),
            width: element.getAttribute("width")
              ? parseInt(element.getAttribute("width")!, 10)
              : null,
            height: element.getAttribute("height")
              ? parseInt(element.getAttribute("height")!, 10)
              : null,
            align: element.getAttribute("data-align") || "left",
            link: element.getAttribute("data-link") || null,
          };

          console.log("🔍 PARSE getAttrs:", attrs);
          return attrs;
        },
      },
    ];
  },

  renderHTML({ node }) {
    console.log("🔍 ========== RENDER HTML ==========");

    const { src, alt, title, width, height, align, link } = node.attrs;

    const imgAttrs: Record<string, any> = {
      src,
      class: "blog-image",
    };

    if (alt) imgAttrs.alt = alt;
    if (title) imgAttrs.title = title;

    if (width && typeof width === "number" && width > 0) {
      imgAttrs.width = String(width);
      imgAttrs.style = `width: ${width}px;`;
      console.log("✅ Width:", width);
    }

    if (height && typeof height === "number" && height > 0) {
      imgAttrs.height = String(height);
      imgAttrs.style = imgAttrs.style
        ? `${imgAttrs.style} height: ${height}px;`
        : `height: ${height}px;`;
      console.log("✅ Height:", height);
    }

    if (align) {
      imgAttrs["data-align"] = align;
      console.log("✅ Align:", align);
    }

    if (link && link.trim() !== "") {
      imgAttrs["data-link"] = link;
      console.log("✅ Link:", link);
    }

    console.log("🔍 HTML finale:", imgAttrs);
    console.log("🔍 ===================================");

    const htmlAttributes = this.options.HTMLAttributes || {};
    const mergedImgAttrs = mergeAttributes(htmlAttributes, imgAttrs);

    if (link && link.trim() !== "") {
      const linkAttrs: Record<string, any> = {
        href: link,
        target: "_blank",
        rel: "noopener noreferrer",
        class: `image-link-wrapper${align ? ` align-${align}` : ""}`,
      };

      if (align) {
        linkAttrs["data-align"] = align;
      }

      return ["a", linkAttrs, ["img", mergedImgAttrs]];
    }

    // ALTRIMENTI RITORNA L'IMMAGINE SENZA LINK
    const finalImgClass = align ? `blog-image align-${align}` : "blog-image";
    return ["img", mergeAttributes(mergedImgAttrs, { class: finalImgClass })];
  },

  addCommands() {
    return {
      setImage:
        (options: SetImageOptions) =>
        ({ commands }) => {
          console.log("🔍 setImage:", options);
          const attrs = {
            src: options.src,
            alt: options.alt || null,
            title: options.title || null,
            width: options.width || null,
            height: options.height || null,
            align: options.align || "left",
            link: options.link || null,
          };
          return commands.insertContent({
            type: this.name,
            attrs,
          });
        },

      setImageAlign:
        (align) =>
        ({ commands, state }) => {
          console.log("🔍 setImageAlign:", align);
          const { selection } = state;
          const { from } = selection;
          const node = state.doc.nodeAt(from);

          if (node && node.type.name === this.name) {
            console.log("✅ Updating align to:", align);
            console.log("✅ Current attrs:", node.attrs);
            return commands.updateAttributes(this.name, { align });
          }

          console.log("❌ Node non trovato o tipo sbagliato");
          return false;
        },
      removeImageLink:
        () =>
        ({ commands, state }) => {
          console.log("🔍 removeImageLink");
          const { selection } = state;
          const { from } = selection;
          const node = state.doc.nodeAt(from);

          if (node && node.type.name === this.name) {
            console.log("✅ Removing link");
            console.log("✅ Current attrs:", node.attrs);
            return commands.updateAttributes(this.name, { link: null });
          }

          console.log("❌ Node non trovato o tipo sbagliato");
          return false;
        },
    };
  },
});
