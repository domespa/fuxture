import {
  useEditor,
  EditorContent,
  ReactNodeViewRenderer,
  BubbleMenu,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { MenuBar } from "./MenuBar";
import "./editor.css";
import { ResizableImage } from "./ResizableImage";
import { ImageResizer } from "./ImageResizer";
import { ImageToolbar } from "./ImageToolbar";
import { LinkBubble } from "./LinkBubble";
import { useEffect, useState, useRef, memo } from "react";
import { NodeSelection } from "@tiptap/pm/state";

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const TiptapEditorComponent = ({
  content,
  onChange,
  placeholder = "Inizia a scrivere...",
}: TiptapEditorProps) => {
  const [showImageToolbar, setShowImageToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [currentImageAlign, setCurrentImageAlign] = useState<string>("left");
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const initialContentRef = useRef<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
          class: "editor-link",
        },
      }),
      ResizableImage.configure({
        inline: false,
        HTMLAttributes: {},
      }).extend({
        addNodeView() {
          return ReactNodeViewRenderer(ImageResizer);
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      console.log("🔍 HTML SALVATO:", html);
      onChange(html);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (!editor || !content) return;
    if (initialContentRef.current !== content) {
      editor.commands.setContent(content);
      initialContentRef.current = content;
    }
  }, [editor, content]);

  useEffect(() => {
    if (!editor) return;

    const updateImageToolbar = () => {
      const { selection } = editor.state;
      let node = null;
      let pos = selection.from;

      if (selection instanceof NodeSelection) {
        node = selection.node;
        pos = selection.from;
      } else {
        node = editor.state.doc.nodeAt(selection.from);
      }

      if (node && node.type.name === "resizableImage") {
        const imageElement = editor.view.nodeDOM(pos) as HTMLElement;
        if (!imageElement || !editorContainerRef.current) return;

        const imgRect = imageElement.getBoundingClientRect();
        const containerRect =
          editorContainerRef.current.getBoundingClientRect();

        setToolbarPosition({
          top: imgRect.top - containerRect.top - 50,
          left: imgRect.left - containerRect.left + imgRect.width / 2,
        });

        setCurrentImageAlign(node.attrs.align || "left");
        setShowImageToolbar(true);
      } else {
        setShowImageToolbar(false);
      }
    };

    editor.on("selectionUpdate", updateImageToolbar);
    const editorElement = editor.view.dom;
    editorElement.addEventListener("scroll", updateImageToolbar);

    return () => {
      editor.off("selectionUpdate", updateImageToolbar);
      editorElement.removeEventListener("scroll", updateImageToolbar);
    };
  }, [editor]);

  const handleRemoveLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetMark("link").run();
  };

  return (
    <div
      className="tiptap-editor"
      ref={editorContainerRef}
      style={{ position: "relative" }}
    >
      <MenuBar editor={editor} />

      {/* Link Bubble Menu */}
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100, placement: "bottom" }}
          shouldShow={({ editor, state }) => {
            return editor.isActive("link");
          }}
        >
          <LinkBubble
            editor={editor}
            url={editor.getAttributes("link").href || ""}
            onRemove={handleRemoveLink}
          />
        </BubbleMenu>
      )}

      {/* Image Toolbar */}
      {showImageToolbar && editor && (
        <div
          style={{
            position: "absolute",
            top: `${toolbarPosition.top}px`,
            left: `${toolbarPosition.left}px`,
            transform: "translateX(-50%)",
            zIndex: 50,
          }}
        >
          <ImageToolbar editor={editor} currentAlign={currentImageAlign} />
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
};

export const TiptapEditor = memo(
  TiptapEditorComponent,
  (prevProps, nextProps) => {
    const contentChanged = prevProps.content !== nextProps.content;
    const placeholderChanged = prevProps.placeholder !== nextProps.placeholder;

    if (contentChanged || placeholderChanged) {
      console.log("🔄 TiptapEditor re-render:", {
        contentChanged,
        placeholderChanged,
      });
      return false;
    }

    return true;
  }
);

TiptapEditor.displayName = "TiptapEditor";
