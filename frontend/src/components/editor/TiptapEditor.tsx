import { useEditor, EditorContent, ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { MenuBar } from "./MenuBar";
import "./editor.css";
import { ResizableImage } from "./extensions/ResizableImage";
import { ImageResizer } from "./ImageResizer";
import { ImageToolbar } from "./ImageToolbar";
import { useEffect, useState } from "react";

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

// ====================================================================================================== //
//                                          COMPONENTE
// ====================================================================================================== //
export const TiptapEditor = ({
  content,
  onChange,
  placeholder = "Inizia a scrivere...",
}: TiptapEditorProps) => {
  const [showImageToolbar, setShowImageToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [currentImageAlign, setCurrentImageAlign] = useState<string>("left");
  // CONFIGURAZIONE EDITOR CON USEEDITORHOOK
  const editor = useEditor({
    extensions: [
      // TITOLO
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        link: false,
      }),

      // ALLINEAMENTO DEL TESTO
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right"],
      }),

      // LINK CLICCABILI
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          target: "_blank",
          rel: "nopener noreferrer",
        },
      }),

      // IMMAGINI
      ResizableImage.configure({
        inline: false,
        HTMLAttributes: {
          class: "editor-image",
        },
      }).extend({
        addNodeView() {
          return ReactNodeViewRenderer(ImageResizer);
        },
      }),

      // PLACEHOLDER
      Placeholder.configure({
        placeholder: placeholder,
      }),
    ],

    // CONTENUTO INIZIALE PRESO DAL BE
    content: content,

    // CALLBACK QUANDO CAMBIA IL CONTENUTO
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },

    // OPZIONI EDITOR
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  useEffect(() => {
    if (!editor) return;

    const updateImageToolbar = () => {
      const { selection } = editor.state;
      const { from } = selection;

      // TROVIAMO IL NODO
      const node = editor.state.doc.nodeAt(from);

      // CONTROLLIAMO SE è UN IMMAGINI
      if (node && node.type.name === "resizableImage") {
        // TROVIAMO L'ELEMENT DEL DOM
        const imageElement = editor.view.nodeDOM(from) as HTMLElement;

        if (imageElement) {
          const rect = imageElement.getBoundingClientRect();

          setToolbarPosition({
            top: rect.top - 50,
            left: rect.left + rect.width / 2,
          });
          // CALCOLIAMO LA POSIZIONE
          setToolbarPosition({
            top: rect.top - 50, // 50PX SOPRA
            left: rect.left + rect.width / 2, // CENTRATO ORIZZ.
          });

          // OTTENIAMO ALLINEAMENTO CORRENTE
          const align = node.attrs.align || "left";
          setCurrentImageAlign(align);

          setShowImageToolbar(true);
        }
      } else {
        setShowImageToolbar(false);
      }
    };

    // AGGIORNIAMO QUANDO CAMBIAMO LA POSIZIONE
    editor.on("selectionUpdate", updateImageToolbar);
    editor.on("update", updateImageToolbar);

    const editorElement = editor.view.dom;
    editorElement.addEventListener("scroll", updateImageToolbar);
    window.addEventListener("scroll", updateImageToolbar);

    // PULIAMO
    return () => {
      editor.off("selectionUpdate", updateImageToolbar);
      editor.off("update", updateImageToolbar);
      editorElement.removeEventListener("scroll", updateImageToolbar);
      window.removeEventListener("scroll", updateImageToolbar);
    };
  }, [editor]);

  return (
    <div className="tiptap-editor">
      {/* Toolbar con bottoni */}
      <MenuBar editor={editor} />

      {/* Image Toolbar */}
      {showImageToolbar && editor && (
        <ImageToolbar
          editor={editor}
          top={toolbarPosition.top}
          left={toolbarPosition.left}
          currentAlign={currentImageAlign}
        />
      )}

      {/* Area di editing */}
      <EditorContent editor={editor} />
    </div>
  );
};
