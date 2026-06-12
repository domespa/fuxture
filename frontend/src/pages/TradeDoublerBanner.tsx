import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { TradeDoublerBannerView } from "./TradeDoublerView";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    tradeDoublerBanner: {
      insertTradeDoublerBanner: (attrs: {
        programId: string;
        affiliateId: string;
        bannerId: string;
        width?: string;
        height?: string;
        align?: string;
      }) => ReturnType;
      setBannerAlign: (align: string) => ReturnType;
    };
  }
}

export const TradeDoublerBanner = Node.create({
  name: "tradeDoublerBanner",
  group: "block",
  atom: true,

  addNodeView() {
    return ReactNodeViewRenderer(TradeDoublerBannerView);
  },

  addAttributes() {
    return {
      programId: { default: "" },
      affiliateId: { default: "" },
      bannerId: { default: "" },
      width: { default: "728" },
      height: { default: "90" },
      align: { default: "center" },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-type="td-banner"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, { "data-type": "td-banner" }),
    ];
  },

  addCommands() {
    return {
      insertTradeDoublerBanner:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs,
          });
        },
      setBannerAlign:
        (align: string) =>
        ({ commands, state }) => {
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
