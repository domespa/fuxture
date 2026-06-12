import { NodeViewWrapper } from "@tiptap/react";

export const TradeDoublerBannerView = ({ node }: { node: any }) => {
  const { width, height, bannerId, programId, align = "center" } = node.attrs;

  return (
    <NodeViewWrapper>
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
          margin:
            align === "center"
              ? "0 auto"
              : align === "right"
                ? "0 0 0 auto"
                : "0 auto 0 0",
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
