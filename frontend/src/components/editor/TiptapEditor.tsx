import { useEditor, EditorContent, ReactNodeViewRenderer } from "@tiptap/react";
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
import { HtmlModal } from "./HtmlModal";
import { useEffect, useState, useRef, memo } from "react";
import { NodeSelection } from "@tiptap/pm/state";
import { AwinBanner } from "./Banner";
import { AwinBannerLink } from "./BannerLink";
import { TradeDoublerBanner } from "@/pages/TradeDoublerBanner";
import { BannerToolbar } from "./BannerToolbar";

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
  const [showLinkBubble, setShowLinkBubble] = useState(false);
  const [isHtmlModalOpen, setIsHtmlModalOpen] = useState(false);
  const [linkBubblePosition, setLinkBubblePosition] = useState({
    top: 0,
    left: 0,
  });
  const [currentLinkUrl, setCurrentLinkUrl] = useState("");
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [currentImageAlign, setCurrentImageAlign] = useState<string>("left");
  const [showBannerToolbar, setShowBannerToolbar] = useState(false);
  const [bannerToolbarPosition, setBannerToolbarPosition] = useState({
    top: 0,
    left: 0,
  });
  const [currentBannerAlign, setCurrentBannerAlign] =
    useState<string>("center");
  const [currentBannerType, setCurrentBannerType] = useState<
    "tradeDoublerBanner" | "awinBannerLink"
  >("tradeDoublerBanner");
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
      AwinBanner,
      AwinBannerLink,
      TradeDoublerBanner,
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

    const updateBannerToolbar = () => {
      const { selection } = editor.state;
      let node = null;
      let pos = selection.from;

      if (selection instanceof NodeSelection) {
        node = selection.node;
        pos = selection.from;
      } else {
        node = editor.state.doc.nodeAt(selection.from);
      }

      const isTD = node?.type.name === "tradeDoublerBanner";
      const isAwin = node?.type.name === "awinBannerLink";

      if ((isTD || isAwin) && editorContainerRef.current) {
        const bannerElement = editor.view.nodeDOM(pos) as HTMLElement;
        if (!bannerElement) return;

        const rect = bannerElement.getBoundingClientRect();
        const containerRect =
          editorContainerRef.current.getBoundingClientRect();

        setBannerToolbarPosition({
          top: rect.top - containerRect.top - 50,
          left: containerRect.width / 2,
        });

        setCurrentBannerAlign(node?.attrs?.align || "center");
        setCurrentBannerType(isTD ? "tradeDoublerBanner" : "awinBannerLink");
        setShowBannerToolbar(true);
      } else {
        setShowBannerToolbar(false);
      }
    };

    editor.on("selectionUpdate", updateBannerToolbar);
    editor.on("transaction", updateBannerToolbar);

    return () => {
      editor.off("selectionUpdate", updateBannerToolbar);
      editor.off("transaction", updateBannerToolbar);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const updateLinkBubble = () => {
      const { selection, doc } = editor.state;
      const { from } = selection;

      if (editor.isActive("link")) {
        const linkMark = doc
          .resolve(from)
          .marks()
          .find((mark) => mark.type.name === "link");

        if (linkMark && editorContainerRef.current) {
          setCurrentLinkUrl(linkMark.attrs.href);

          const { view } = editor;
          const start = view.coordsAtPos(from);
          const containerRect =
            editorContainerRef.current.getBoundingClientRect();

          setLinkBubblePosition({
            top: start.top - containerRect.top + 30,
            left: start.left - containerRect.left,
          });

          setShowLinkBubble(true);
        } else {
          setShowLinkBubble(false);
        }
      } else {
        setShowLinkBubble(false);
      }
    };

    editor.on("selectionUpdate", updateLinkBubble);
    editor.on("transaction", updateLinkBubble);

    return () => {
      editor.off("selectionUpdate", updateLinkBubble);
      editor.off("transaction", updateLinkBubble);
    };
  }, [editor]);

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
    editor.on("transaction", updateImageToolbar);
    const editorElement = editor.view.dom;
    editorElement.addEventListener("scroll", updateImageToolbar);

    return () => {
      editor.off("selectionUpdate", updateImageToolbar);
      editor.off("transaction", updateImageToolbar);
      editorElement.removeEventListener("scroll", updateImageToolbar);
    };
  }, [editor]);

  const handleRemoveLink = () => {
    if (editor) {
      editor.chain().focus().extendMarkRange("link").unsetMark("link").run();
      setShowLinkBubble(false);
    }
  };

  const insertHtmlCode = (html: string) => {
    if (!editor) return;

    try {
      const data = JSON.parse(html);

      if (data.type === "awinBanner") {
        editor.chain().focus().insertAwinBanner(data.attrs).run();
        return;
      }
      if (data.type === "awinBannerLink") {
        editor.chain().focus().insertAwinBannerLink(data.attrs).run();
        return;
      }
      if (data.type === "tradeDoublerBanner") {
        editor.chain().focus().insertTradeDoublerBanner(data.attrs).run();
        return;
      }
    } catch (e) {
      const tdMatch = html.match(/imp\?type\([^)]+\)g\((\d+)\)a\((\d+)\)/);
      const clickMatch = html.match(/click\?p=(\d+)&a=(\d+)&g=(\d+)/);
      const sizeMatch = html.match(/width="(\d+)"\s+height="(\d+)"/);

      if (tdMatch) {
        editor
          .chain()
          .focus()
          .insertTradeDoublerBanner({
            bannerId: tdMatch[1],
            affiliateId: tdMatch[2],
            programId: clickMatch?.[1] ?? "",
            width: sizeMatch?.[1] ?? "728",
            height: sizeMatch?.[2] ?? "90",
            align: "center",
          })
          .run();
        return;
      }

      editor.chain().focus().insertContent(html).run();
    }
  };

  if (!editor) return null;

  return (
    <div
      className="tiptap-editor"
      ref={editorContainerRef}
      style={{ position: "relative" }}
    >
      <MenuBar
        editor={editor}
        onOpenHtmlModal={() => setIsHtmlModalOpen(true)}
      />

      {showLinkBubble && (
        <div
          style={{
            position: "absolute",
            top: `${linkBubblePosition.top}px`,
            left: `${linkBubblePosition.left}px`,
            zIndex: 50,
          }}
        >
          <LinkBubble
            editor={editor}
            url={currentLinkUrl}
            onRemove={handleRemoveLink}
          />
        </div>
      )}

      {showImageToolbar && (
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

      {showBannerToolbar && (
        <div
          style={{
            position: "absolute",
            top: `${bannerToolbarPosition.top}px`,
            left: `${bannerToolbarPosition.left}px`,
            transform: "translateX(-50%)",
            zIndex: 50,
          }}
        >
          <BannerToolbar
            editor={editor}
            currentAlign={currentBannerAlign}
            bannerType={currentBannerType}
          />
        </div>
      )}

      <EditorContent editor={editor} />

      <HtmlModal
        isOpen={isHtmlModalOpen}
        onClose={() => setIsHtmlModalOpen(false)}
        onInsert={insertHtmlCode}
      />
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
  },
);

TiptapEditor.displayName = "TiptapEditor";
