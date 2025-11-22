import { Editor } from "@tiptap/react";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface LinkBubbleProps {
  editor: Editor;
  url: string;
  onRemove: () => void;
}

export const LinkBubble = ({ editor, url, onRemove }: LinkBubbleProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editUrl, setEditUrl] = useState(url);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditUrl(url);
  }, [url]);

  const handleEdit = () => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSave = () => {
    let validatedUrl = editUrl.trim();

    if (!validatedUrl) {
      onRemove();
      return;
    }

    // Aggiungi https:// se manca
    if (
      !validatedUrl.startsWith("http://") &&
      !validatedUrl.startsWith("https://")
    ) {
      validatedUrl = "https://" + validatedUrl;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setMark("link", { href: validatedUrl })
      .run();

    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      setEditUrl(url);
      setIsEditing(false);
      editor.commands.focus();
    }
  };

  const handleOpenLink = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (isEditing) {
    return (
      <div className="link-bubble editing">
        <input
          ref={inputRef}
          type="url"
          value={editUrl}
          onChange={(e) => setEditUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://esempio.com"
          className="link-bubble-input"
        />
        <button
          type="button"
          onClick={handleSave}
          className="link-bubble-button save"
          title="Salva"
        >
          ✓
        </button>
        <button
          type="button"
          onClick={() => {
            setEditUrl(url);
            setIsEditing(false);
            editor.commands.focus();
          }}
          className="link-bubble-button cancel"
          title="Annulla"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="link-bubble">
      <a
        href={url}
        onClick={(e) => {
          e.preventDefault();
          handleOpenLink();
        }}
        className="link-bubble-url"
        title={url}
      >
        {url.length > 40 ? url.substring(0, 40) + "..." : url}
      </a>

      <div className="link-bubble-actions">
        <button
          type="button"
          onClick={handleOpenLink}
          className="link-bubble-button"
          title="Apri link"
        >
          <ExternalLink size={14} />
        </button>

        <button
          type="button"
          onClick={handleEdit}
          className="link-bubble-button"
          title="Modifica link"
        >
          <Pencil size={14} />
        </button>

        <button
          type="button"
          onClick={onRemove}
          className="link-bubble-button delete"
          title="Rimuovi link"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};
