import { Editor } from "@tiptap/react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Trash2,
} from "lucide-react";

interface ImageToolbarProps {
  editor: Editor;
  top: number;
  left: number;
  currentAlign: string;
}

export const ImageToolbar = ({
  editor,
  top,
  left,
  currentAlign,
}: ImageToolbarProps) => {
  const setAlign = (
    align:
      | "left"
      | "center"
      | "right"
      | "float-left"
      | "float-right"
      | "full-width"
  ) => {
    editor.commands.setImageAlign(align);
    editor.commands.focus();
  };

  const deleteImage = () => {
    editor.commands.deleteSelection();
  };

  const buttons = [
    {
      align: "float-left",
      icon: AlignLeft,
      label: "Allinea a sinistra",
      tooltip: "Il testo a destra",
    },
    {
      align: "center",
      icon: AlignCenter,
      label: "Centra",
      tooltip: "Imagine centrata",
    },
    {
      align: "float-right",
      icon: AlignRight,
      label: "Allinea a destra",
      tooltip: "Il testo a sinistra",
    },
    {
      align: "full-width",
      icon: Maximize2,
      label: "Massima grandezza",
      tooltip: "Massima grandezza",
    },
  ];

  return (
    <div
      className="image-toolbar"
      style={{
        position: "fixed",
        top: `${top}px`,
        left: `${left}px`,
        transform: "translateX(-50%)",
        zIndex: 50,
      }}
    >
      <div className="flex items-center gap-1 bg-gray-900 rounded-lg shadow-lg p-1 border border-gray-700">
        {buttons.map(({ align, icon: Icon, tooltip }) => (
          <button
            key={align}
            onClick={() => setAlign(align as any)}
            title={tooltip}
            className={`
              p-2 rounded transition-colors
              ${
                currentAlign === align
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }
            `}
          >
            <Icon size={18} />
          </button>
        ))}

        {/* Divider */}
        <div className="w-px h-6 bg-gray-700 mx-1" />

        {/* Delete button */}
        <button
          onClick={deleteImage}
          title="Remove image"
          className="p-2 rounded text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};
