import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { postsAPI, commentsAPI, api } from "@/services/api";
import type { PostResponse } from "@/types/post.types";
import type { CommentResponse, CommentStatus } from "@/types/comment.types";
import {
  Calendar,
  Eye,
  Clock,
  User,
  Share2,
  ChevronLeft,
  MessageCircle,
  X,
  Send,
  AlertCircle,
} from "lucide-react";
import "./post-content.css";

export default function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<PostResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  useEffect(() => {
    if (post && commentsOpen) {
      fetchComments();
    }
  }, [post, commentsOpen]);

  // CARICA I BANNER AWIN DOPO IL RENDERING DEL CONTENUTO
  useEffect(() => {
    if (!post) return;

    console.log("🔍 Post content HTML:", post.content);

    const bannerPlaceholders = document.querySelectorAll(
      'span[data-type="awin-banner"]',
    );

    console.log("🔍 Banner placeholders trovati:", bannerPlaceholders.length);

    bannerPlaceholders.forEach((placeholder, index) => {
      const scriptUrl = placeholder.getAttribute("scripturl");
      const iframeUrl = placeholder.getAttribute("iframeurl");
      const width = placeholder.getAttribute("width") || "300";
      const height = placeholder.getAttribute("height") || "600";
      const align = placeholder.getAttribute("align") || "left";

      console.log(`📊 Attributi banner ${index}:`, {
        scriptUrl,
        iframeUrl,
        width,
        height,
        align,
      });

      if (iframeUrl) {
        console.log(`✅ Creando iframe per banner ${index}...`);

        // USA DIRETTAMENTE L'IFRAME
        const iframe = document.createElement("iframe");
        iframe.src = iframeUrl;
        iframe.width = width;
        iframe.height = height;
        iframe.style.border = "0";
        iframe.style.display = "block";
        iframe.style.maxWidth = "100%";
        iframe.setAttribute("frameborder", "0");
        iframe.setAttribute("scrolling", "no");

        iframe.setAttribute(
          "sandbox",
          "allow-scripts allow-same-origin allow-top-navigation allow-top-navigation-by-user-activation allow-popups allow-forms",
        );

        // Applica stili di allineamento
        if (align === "left") {
          iframe.style.float = "left";
          iframe.style.marginRight = "20px";
          iframe.style.marginBottom = "10px";
        } else if (align === "right") {
          iframe.style.float = "right";
          iframe.style.marginLeft = "20px";
          iframe.style.marginBottom = "10px";
        } else if (align === "center") {
          iframe.style.margin = "20px auto";
          iframe.style.display = "block";
        }

        iframe.onload = () => console.log(`✅ Iframe ${index} caricato!`);
        iframe.onerror = () =>
          console.error(`❌ Errore caricamento iframe ${index}`);

        // Sostituisci il placeholder con l'iframe
        placeholder.replaceWith(iframe);
        console.log(`✅ Iframe ${index} sostituito!`);
      }
    });
  }, [post]);

  const fetchPost = async () => {
    try {
      setIsLoading(true);
      const data = await postsAPI.getPostBySlug(slug!);
      setPost(data);
    } catch (error) {
      console.error("Error fetching post", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!post) return;

    try {
      setCommentsLoading(true);
      const response = await commentsAPI.getComments({
        postId: post.id,
        status: "APPROVED" as CommentStatus,
      });

      setComments(response.comments);
    } catch (error) {
      console.error("Error fetching comments", error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !commentAuthor.trim() || !commentEmail.trim()) {
      setSubmitError("Compila tutti i campi obbligatori");
      return;
    }

    if (!post) return;

    try {
      setSubmitError(null);
      setSubmitSuccess(false);

      await api.post(`/posts/${post.id}/comments`, {
        content: newComment,
        authorName: commentAuthor,
        authorEmail: commentEmail,
      });

      setNewComment("");
      setCommentAuthor("");
      setCommentEmail("");
      setSubmitSuccess(true);

      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error: any) {
      console.error("Error submitting comment", error);
      setSubmitError(
        error.response?.data?.message || "Errore nell'invio del commento",
      );
    }
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const formatDate = (date: Date | null | string) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatCommentDate = (date: Date | string) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffMs = now.getTime() - commentDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Ora";
    if (diffMins < 60) return `${diffMins} minuti fa`;
    if (diffHours < 24) return `${diffHours} ore fa`;
    if (diffDays === 1) return "Ieri";
    if (diffDays < 7) return `${diffDays} giorni fa`;
    return formatDate(date);
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#F8FAFC" }}
      >
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4"
            style={{
              borderColor: "#F8FAFC",
              borderTopColor: "#1D315E",
            }}
          />
          <p className="text-gray-600">Caricamento articolo...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#F8FAFC" }}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Articolo non trovato
          </h2>
          <Link
            to="/posts"
            className="hover:underline"
            style={{ color: "#1D315E" }}
          >
            Torna al blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8FAFC" }}>
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/posts"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium">Torna al blog</span>
            </Link>

            <button
              onClick={() => setCommentsOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-white transition-all duration-300 hover:shadow-lg"
              style={{ backgroundColor: "#1D315E" }}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="hidden md:inline">Commenti</span>
              <span className="bg-white text-gray-900 px-2 py-0.5 rounded-full text-xs font-bold">
                {comments.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Category Badge */}
        {post.category && (
          <div className="mb-6">
            <span
              className="inline-block px-4 py-2 rounded-full text-sm font-bold"
              style={{
                backgroundColor: post.category.color || "#1D315E",
                color: "white",
              }}
            >
              {post.category.icon && (
                <span className="mr-2">{post.category.icon}</span>
              )}
              {post.category.name}
            </span>
          </div>
        )}

        {/* Title */}
        <h1
          className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight"
          style={{ color: "#1F2937" }}
        >
          {post.title}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-6 py-6 border-y border-gray-200 mb-8">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-5 h-5" />
            <span>{formatDate(post.publishedAt)}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-5 h-5" />
            <span>{calculateReadTime(post.content)} min di lettura</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Eye className="w-5 h-5" />
            <span>{post.views.toLocaleString()} visualizzazioni</span>
          </div>

          <button className="ml-auto flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <Share2 className="w-5 h-5" />
            <span className="font-medium">Condividi</span>
          </button>
        </div>

        {/* Content */}
        <div
          className="post-content prose prose-lg max-w-none mb-12"
          style={{ color: "#1F2937" }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="py-8 border-t border-gray-200">
            <h3 className="text-lg font-bold mb-4" style={{ color: "#1F2937" }}>
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Comments CTA */}
        <div className="mt-12 text-center">
          <button
            onClick={() => setCommentsOpen(true)}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-white text-lg transition-all duration-300 hover:shadow-2xl hover:scale-105"
            style={{ backgroundColor: "#1D315E" }}
          >
            <MessageCircle className="w-6 h-6" />
            Partecipa alla discussione ({comments.length} commenti)
          </button>
        </div>
      </article>

      {/* COMMENTS SIDEBAR */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[500px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          commentsOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div
            className="px-6 py-5 flex items-center justify-between"
            style={{ backgroundColor: "#1F2937" }}
          >
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageCircle className="w-6 h-6" />I commenti dei lettori
            </h3>
            <button
              onClick={() => setCommentsOpen(false)}
              className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              Fuxture crede nel valore del confronto tra diverse opinioni.
              Partecipa al dibattito con gli altri membri della community.
            </p>
          </div>

          <div className="px-6 py-6 border-b border-gray-200 bg-white">
            <form onSubmit={handleSubmitComment}>
              {submitSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800">
                    Commento inviato! Sarà visibile dopo l'approvazione.
                  </p>
                </div>
              )}

              {submitError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{submitError}</p>
                </div>
              )}

              <input
                type="text"
                placeholder="Il tuo nome *"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:border-transparent"
                required
              />
              <input
                type="email"
                placeholder="La tua email *"
                value={commentEmail}
                onChange={(e) => setCommentEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:border-transparent"
                required
              />
              <textarea
                placeholder="Inizia la conversazione *"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:border-transparent mb-3"
                required
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full font-bold text-white transition-all duration-300 hover:shadow-lg flex items-center gap-2"
                  style={{ backgroundColor: "#1D315E" }}
                >
                  INVIA
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-3 bg-white border-b border-gray-200 sticky top-0">
              <div className="flex items-center justify-between">
                <span
                  className="font-bold text-sm"
                  style={{ color: "#1F2937" }}
                >
                  TUTTI I COMMENTI ({comments.length})
                </span>
              </div>
            </div>

            <div className="px-6 py-4">
              {commentsLoading ? (
                <div className="text-center py-12">
                  <div
                    className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4"
                    style={{
                      borderColor: "#F8FAFC",
                      borderTopColor: "#1D315E",
                    }}
                  />
                  <p className="text-gray-500">Caricamento commenti...</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">
                    Sii il primo a commentare
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="pb-6 border-b border-gray-200"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="font-bold text-sm"
                              style={{ color: "#1F2937" }}
                            >
                              {comment.authorName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatCommentDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Con tecnologia{" "}
              <span className="font-bold" style={{ color: "#1D315E" }}>
                Fuxture Comments
              </span>
            </p>
          </div>
        </div>
      </div>

      {commentsOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setCommentsOpen(false)}
        />
      )}
    </div>
  );
}
