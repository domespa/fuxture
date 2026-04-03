import { NodeViewWrapper } from "@tiptap/react";

export const TradeDoublerBannerView = ({ node }: { node: any }) => {
  const { width, height, bannerId, programId } = node.attrs;

  return (
    <NodeViewWrapper>
      <div
        contentEditable={false}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: `${width}px`,
          maxWidth: "100%",
          height: `${height}px`,
          border: "2px dashed #94a3b8",
          borderRadius: "8px",
          backgroundColor: "#f8fafc",
          margin: "12px auto",
          cursor: "default",
          userSelect: "none",
        }}
      >
        <div style={{ textAlign: "center", color: "#64748b" }}>
          <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: 4 }}>
            📢 Banner Tradedoubler
          </div>
          <div style={{ fontSize: "11px" }}>
            {width}×{height}px · ID: {bannerId} · Prog: {programId}
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
};
