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
      programId: { default: "" }, // p=363209
      affiliateId: { default: "" }, // a=2887379
      bannerId: { default: "" }, // g=25695218
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
    };
  },
});
