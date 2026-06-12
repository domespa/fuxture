import { Editor } from "@tiptap/react";
import { AlignLeft, AlignCenter, AlignRight, Trash2 } from "lucide-react";

interface BannerToolbarProps {
  editor: Editor;
  currentAlign: string;
}

export const BannerToolbar = ({ editor, currentAlign }: BannerToolbarProps) => {
  const setAlign = (align: "left" | "center" | "right") => {
    editor.commands.setBannerAlign(align);
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
