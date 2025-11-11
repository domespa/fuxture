import { Node, mergeAttributes } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export interface ResizableImageOptions {
  inline: boolean;
  allowBase64: boolean;
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    resizableImage: {
      setImage: (options: {
        src: string;
        alt?: string;
        title?: string;
        width?: number;
        height?: number;
      }) => ReturnType;
      setImageAlign: (
        align:
          | "left"
          | "center"
          | "right"
          | "float-left"
          | "float-right"
          | "full-width"
      ) => ReturnType;
    };
  }
}
// MODIFICHIAMO LE DIMENSIONI DELL'IMAMGINE
export const ResizableImage = Node.create<ResizableImageOptions>({
  name: "resizableImage",

  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
    };
  },

  inline() {
    return this.options.inline;
  },

  group() {
    return this.options.inline ? "inline" : "block";
  },

  draggable: true,

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
          const width = element.style.width || element.getAttribute("width");
          return width ? parseInt(width) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {};
          }
          return {
            width: attributes.width,
            style: `width: ${attributes.width}px`,
          };
        },
      },
      height: {
        default: null,
        parseHTML: (element) => {
          const height = element.style.height || element.getAttribute("height");
          return height ? parseInt(height) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {};
          }
          return {
            height: attributes.height,
            style: `height: ${attributes.height}px`,
          };
        },
      },
      align: {
        default: "left",
        parseHTML: (element) => {
          return element.getAttribute("data-align") || "left";
        },
        renderHTML: (attributes) => {
          const align = attributes.align || "left";
          return {
            "data-align": align,
            class: `img-align-${align}`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "img[src]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "img",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    ];
  },

  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
      setImageAlign:
        (align) =>
        ({ commands, state, tr }) => {
          const { selection } = state;
          const { from } = selection;

          // TROVA L'IMMAGINE
          const node = state.doc.nodeAt(from);

          if (node && node.type.name === this.name) {
            // AGGIORNIAMOGLI L'ATTRIBUTO
            return commands.updateAttributes(this.name, { align });
          }

          return false;
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("resizableImage"),
        props: {
          decorations: (state) => {
            const { doc, selection } = state;
            const decorations: Decoration[] = [];

            // GROVIAMO L'IMAMGINE
            doc.descendants((node, pos) => {
              if (node.type.name === this.name) {
                if (
                  selection.from === pos ||
                  (selection.from <= pos && selection.to >= pos + node.nodeSize)
                ) {
                  // AGGIUNGIAMO LA CLASSE
                  decorations.push(
                    Decoration.node(pos, pos + node.nodeSize, {
                      class: "selected-image",
                    })
                  );
                }
              }
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});
