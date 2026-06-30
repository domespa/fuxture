import { Editor } from "@tiptap/react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowLeftFromLine,
  ArrowRightFromLine,
  Trash2,
} from "lucide-react";

interface BannerToolbarProps {
  editor: Editor;
  currentAlign: string;
  bannerType: "tradeDoublerBanner" | "awinBannerLink";
}

type BannerAlign = "left" | "center" | "right" | "float-left" | "float-right";

export const BannerToolbar = ({
  editor,
  currentAlign,
  bannerType,
}: BannerToolbarProps) => {
  const setAlign = (align: BannerAlign) => {
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

  const buttons: { align: BannerAlign; icon: React.ElementType; tooltip: string }[] = [
    { align: "left", icon: AlignLeft, tooltip: "Sinistra" },
    { align: "center", icon: AlignCenter, tooltip: "Centro" },
    { align: "right", icon: AlignRight, tooltip: "Destra" },
    { align: "float-left", icon: ArrowLeftFromLine, tooltip: "Testo scorre a destra" },
    { align: "float-right", icon: ArrowRightFromLine, tooltip: "Testo scorre a sinistra" },
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
