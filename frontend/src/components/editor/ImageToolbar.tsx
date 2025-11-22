import { Editor } from "@tiptap/react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowLeftFromLine,
  ArrowRightFromLine,
  Trash2,
  Link,
  Unlink,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ImageToolbarProps {
  editor: Editor;
  currentAlign: string;
}

export const ImageToolbar = ({ editor, currentAlign }: ImageToolbarProps) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const { node } = editor.state.selection as any;
    if (node?.attrs?.link) {
      setLinkUrl(node.attrs.link);
    } else {
      setLinkUrl("");
    }
  }, [editor.state.selection]);

  const setAlign = (
    align: "left" | "center" | "right" | "float-left" | "float-right"
  ) => {
    editor.commands.setImageAlign(align);
    editor.commands.focus();
  };

  const deleteImage = () => {
    editor.commands.deleteSelection();
  };

  const toggleLinkInput = () => {
    setShowLinkInput(!showLinkInput);
    if (!showLinkInput) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const setImageLink = () => {
    if (linkUrl.trim()) {
      let validatedUrl = linkUrl.trim();

      // AGGIUNGI https:// se manca
      if (
        !validatedUrl.startsWith("http://") &&
        !validatedUrl.startsWith("https://")
      ) {
        validatedUrl = "https://" + validatedUrl;
      }

      editor.commands.updateAttributes("resizableImage", {
        link: validatedUrl,
      });
    }
    setShowLinkInput(false);
    editor.commands.focus();
  };

  const removeImageLink = () => {
    console.log("🗑️ Removing image link");
    editor.chain().focus().removeImageLink().run();
    setLinkUrl("");
    setShowLinkInput(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setImageLink();
    } else if (e.key === "Escape") {
      setShowLinkInput(false);
      editor.commands.focus();
    }
  };

  const buttons = [
    {
      align: "left" as const,
      icon: AlignLeft,
      label: "Sinistra",
      tooltip: "Allinea a sinistra (senza float)",
    },
    {
      align: "center" as const,
      icon: AlignCenter,
      label: "Centro",
      tooltip: "Centra l'immagine",
    },
    {
      align: "right" as const,
      icon: AlignRight,
      label: "Destra",
      tooltip: "Allinea a destra (senza float)",
    },
    {
      align: "float-left" as const,
      icon: ArrowLeftFromLine,
      label: "Float Left",
      tooltip: "Testo scorre a destra",
    },
    {
      align: "float-right" as const,
      icon: ArrowRightFromLine,
      label: "Float Right",
      tooltip: "Testo scorre a sinistra",
    },
  ];

  return (
    <div className="image-toolbar">
      <div className="toolbar-container">
        {/* Alignment Buttons */}
        {buttons.map(({ align, icon: Icon, tooltip }) => (
          <button
            key={align}
            type="button"
            onClick={() => setAlign(align)}
            title={tooltip}
            className={`toolbar-button ${
              currentAlign === align ? "active" : ""
            }`}
          >
            <Icon size={18} />
          </button>
        ))}

        {/* Divider */}
        <div className="toolbar-divider" />

        {/* Link Button */}
        <button
          type="button"
          onClick={toggleLinkInput}
          title={linkUrl ? "Modifica link" : "Aggiungi link"}
          className={`toolbar-button ${linkUrl ? "active" : ""}`}
        >
          <Link size={18} />
        </button>

        {/* Remove Link Button (solo se c'è un link) */}
        {linkUrl && (
          <button
            type="button"
            onClick={removeImageLink}
            title="Rimuovi link"
            className="toolbar-button"
          >
            <Unlink size={18} />
          </button>
        )}

        {/* Divider */}
        <div className="toolbar-divider" />

        {/* Delete Button */}
        <button
          type="button"
          onClick={deleteImage}
          title="Rimuovi immagine"
          className="toolbar-button delete-button"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Link Input */}
      {showLinkInput && (
        <div className="link-input-container">
          <input
            ref={inputRef}
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://esempio.com"
            className="link-input"
          />
          <button
            type="button"
            onClick={setImageLink}
            className="link-button-save"
            disabled={!linkUrl.trim()}
          >
            Salva
          </button>
          <button
            type="button"
            onClick={() => {
              setShowLinkInput(false);
              editor.commands.focus();
            }}
            className="link-button-cancel"
          >
            Annulla
          </button>
        </div>
      )}
    </div>
  );
};
