import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
} from "lucide-react";

interface MenuBarProps {
  editor: Editor | null;
}

export const MenuBar = ({ editor }: MenuBarProps) => {
  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    let url = window.prompt("Inserisci URL:", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetMark("link").run();
      return;
    }

    // VALIDAZIONE URL
    if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setMark("link", { href: url })
      .run();
  };

  const addImage = () => {
    const url = window.prompt("Inserisci URL immagine:");

    if (url) {
      editor
        .chain()
        .focus()
        .setImage({
          src: url,
        })
        .run();
    }
  };

  return (
    <div className="border-b bg-gray-50 p-2 flex flex-wrap gap-1">
      {/* Gruppo: Formattazione testo */}
      <div className="flex gap-1 border-r pr-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive("bold") ? "bg-gray-300" : ""
          }`}
          title="Grassetto"
        >
          <Bold size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive("italic") ? "bg-gray-300" : ""
          }`}
          title="Corsivo"
        >
          <Italic size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive("strike") ? "bg-gray-300" : ""
          }`}
          title="Barrato"
        >
          <Strikethrough size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive("code") ? "bg-gray-300" : ""
          }`}
          title="Codice"
        >
          <Code size={18} />
        </button>
      </div>

      {/* Gruppo: Headings */}
      <div className="flex gap-1 border-r pr-2">
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive("heading", { level: 1 }) ? "bg-gray-300" : ""
          }`}
          title="Titolo 1"
        >
          <Heading1 size={18} />
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive("heading", { level: 2 }) ? "bg-gray-300" : ""
          }`}
          title="Titolo 2"
        >
          <Heading2 size={18} />
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive("heading", { level: 3 }) ? "bg-gray-300" : ""
          }`}
          title="Titolo 3"
        >
          <Heading3 size={18} />
        </button>
      </div>

      {/* Gruppo: Liste */}
      <div className="flex gap-1 border-r pr-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive("bulletList") ? "bg-gray-300" : ""
          }`}
          title="Lista puntata"
        >
          <List size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive("orderedList") ? "bg-gray-300" : ""
          }`}
          title="Lista numerata"
        >
          <ListOrdered size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive("blockquote") ? "bg-gray-300" : ""
          }`}
          title="Citazione"
        >
          <Quote size={18} />
        </button>
      </div>

      {/* Gruppo: Allineamento */}
      <div className="flex gap-1 border-r pr-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive({ textAlign: "left" }) ? "bg-gray-300" : ""
          }`}
          title="Allinea sinistra"
        >
          <AlignLeft size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive({ textAlign: "center" }) ? "bg-gray-300" : ""
          }`}
          title="Allinea centro"
        >
          <AlignCenter size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive({ textAlign: "right" }) ? "bg-gray-300" : ""
          }`}
          title="Allinea destra"
        >
          <AlignRight size={18} />
        </button>
      </div>

      {/* Gruppo: Link e Immagini */}
      <div className="flex gap-1 border-r pr-2">
        <button
          type="button"
          onClick={setLink}
          className={`p-2 rounded hover:bg-gray-200 ${
            editor.isActive("link") ? "bg-gray-300" : ""
          }`}
          title="Aggiungi link"
        >
          <Link size={18} />
        </button>

        <button
          type="button"
          onClick={addImage}
          className="p-2 rounded hover:bg-gray-200"
          title="Aggiungi immagine"
        >
          <Image size={18} />
        </button>
      </div>

      {/* Gruppo: Altro */}
      <div className="flex gap-1 border-r pr-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded hover:bg-gray-200"
          title="Linea orizzontale"
        >
          <Minus size={18} />
        </button>
      </div>

      {/* Gruppo: Undo/Redo */}
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
          title="Annulla"
        >
          <Undo size={18} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className="p-2 rounded hover:bg-gray-200 disabled:opacity-50"
          title="Ripeti"
        >
          <Redo size={18} />
        </button>
      </div>
    </div>
  );
};
