import { Editor } from "@tiptap/react";
import { AlignLeft, AlignCenter, AlignRight, Trash2 } from "lucide-react";

interface BannerToolbarProps {
  editor: Editor;
  currentAlign: string;
  bannerType: "tradeDoublerBanner" | "awinBannerLink";
}

export const BannerToolbar = ({
  editor,
  currentAlign,
  bannerType,
}: BannerToolbarProps) => {
  const setAlign = (align: "left" | "center" | "right") => {
    if (bannerType === "tradeDoublerBanner") {
      editor.commands.setBannerAlign(align);
    } else {
      editor.commands.setAwinBannerLinkAlign(align);
    }
    editor.commands.focus();
  };

  const deleteBanner = () => {
    editor.commands.deleteSelection();
  };

  const buttons = [
    { align: "left" as const, icon: AlignLeft, tooltip: "Sinistra" },
    { align: "center" as const, icon: AlignCenter, tooltip: "Centro" },
    { align: "right" as const, icon: AlignRight, tooltip: "Destra" },
  ];

  return (
    <div className="image-toolbar">
      <div className="toolbar-container">
        {buttons.map(({ align, icon: Icon, tooltip }) => (
          <button
            key={align}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setAlign(align)}
            title={tooltip}
            className={`toolbar-button ${currentAlign === align ? "active" : ""}`}
          >
            <Icon size={18} />
          </button>
        ))}
        <div className="toolbar-divider" />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={deleteBanner}
          title="Rimuovi banner"
          className="toolbar-button delete-button"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};
