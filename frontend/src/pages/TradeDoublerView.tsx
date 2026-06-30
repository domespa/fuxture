import type { CSSProperties } from "react";
import { NodeViewWrapper } from "@tiptap/react";

const getWrapperStyle = (align: string): CSSProperties => {
  switch (align) {
    case "float-left":
      return { float: "left", margin: "0.5rem 2rem 1rem 0", maxWidth: "50%" };
    case "float-right":
      return { float: "right", margin: "0.5rem 0 1rem 2rem", maxWidth: "50%" };
    case "right":
      return { marginLeft: "auto", marginRight: "0", display: "block" };
    case "center":
      return { margin: "0 auto", display: "block" };
    default:
      return { marginLeft: "0", marginRight: "auto", display: "block" };
  }
};

export const TradeDoublerBannerView = ({ node }: { node: any }) => {
  const { width, height, bannerId, programId, align = "center" } = node.attrs;

  return (
    <NodeViewWrapper style={getWrapperStyle(align) as any}>
      <div
        contentEditable={false}
        style={{
          width: `${width}px`,
          maxWidth: "100%",
          height: `${height}px`,
          border: "2px dashed #94a3b8",
          borderRadius: "8px",
          backgroundColor: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", color: "#64748b" }}>
          <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: 4 }}>
            📢 Banner Tradedoubler
          </div>
          <div style={{ fontSize: "11px" }}>
            {width}×{height}px · ID: {bannerId} · Prog: {programId}
          </div>
          <div style={{ fontSize: "11px", marginTop: 4, color: "#94a3b8" }}>
            Allineamento: {align}
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
};
