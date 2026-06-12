import { NodeViewWrapper } from "@tiptap/react";

export const TradeDoublerBannerView = ({
  node,
  updateAttributes,
}: {
  node: any;
  updateAttributes: any;
}) => {
  const { width, height, bannerId, programId, align = "center" } = node.attrs;

  const getWrapperStyle = (): React.CSSProperties => {
    switch (align) {
      case "left":
        return { display: "block", marginRight: "auto", marginLeft: "0" };
      case "right":
        return { display: "block", marginLeft: "auto", marginRight: "0" };
      case "center":
        return { display: "block", margin: "0 auto" };
      default:
        return { display: "block", margin: "0 auto" };
    }
  };

  return (
    <NodeViewWrapper>
      {/* Controlli allineamento */}
      <div
        contentEditable={false}
        style={{ display: "flex", gap: "6px", marginBottom: "4px" }}
      >
        {["left", "center", "right"].map((a) => (
          <button
            key={a}
            onClick={() => updateAttributes({ align: a })}
            style={{
              padding: "2px 8px",
              fontSize: "11px",
              border: "1px solid #cbd5e1",
              borderRadius: "4px",
              background: align === a ? "#3b82f6" : "#f1f5f9",
              color: align === a ? "#fff" : "#64748b",
              cursor: "pointer",
            }}
          >
            {a}
          </button>
        ))}
      </div>

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
          ...getWrapperStyle(),
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
