import { useEffect, useState } from "react";
import { postsAPI } from "@/services/api";
import type { PostResponse, PostStatus } from "@/types/post.types";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  FileText,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function BlogPostsSlider() {
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await postsAPI.getPosts({
        status: "PUBLISHED" as PostStatus,
        limit: 5,
        sortBy: "publishedAt",
        sortOrder: "desc",
      });

      const postsData = "posts" in response ? response.posts : response;

      if (postsData && postsData.length > 0) {
        setPosts(postsData);
      } else {
        throw new Error("Nessun articolo disponibile");
      }

      setLoading(false);
    } catch (err) {
      console.error("Errore fetch posts:", err);
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Auto-slide ogni 5 secondi
  useEffect(() => {
    if (posts.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % posts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [posts.length]);

  const nextPost = () => {
    setCurrentIndex((prev) => (prev + 1) % posts.length);
  };

  const prevPost = () => {
    setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 text-center">
        <p className="text-red-600 font-semibold mb-3">⚠️ {error}</p>
        <button
          onClick={fetchPosts}
          className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors"
        >
          Riprova
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <FileText className="w-6 h-6" />
            <h2 className="text-2xl font-bold">I Nostri Articoli</h2>
          </div>
        </div>
        <div className="h-[400px] flex items-center justify-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white shadow-lg p-8 text-center">
        <p className="text-gray-500">Nessun articolo disponibile</p>
      </div>
    );
  }

  const currentPost = posts[currentIndex];

  return (
    <div className="bg-white shadow-lg overflow-hidden max-h-[1000px] flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <FileText className="w-6 h-6" />
            <h2 className="text-2xl font-bold">I Nostri Articoli</h2>
          </div>
        </div>
      </div>

      {/* Slider Content */}
      <div className="relative flex-1 flex flex-col">
        <div className="h-[250px] bg-gray-900 relative overflow-hidden flex-shrink-0">
          {currentPost.featuredImage ? (
            <img
              src={currentPost.featuredImage}
              alt={currentPost.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex-1 p-4 flex flex-col justify-between overflow-hidden">
              <FileText className="w-16 h-16 text-white/50" />
            </div>
          )}
        </div>

        <div className="h-1/2 p-4 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 overflow-hidden min-h-0">
            <div className="text-xs text-blue-600 font-bold mb-1">
              {currentPost.category?.name || "Generale"}
            </div>

            {/* Titolo */}
            <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2">
              {currentPost.title}
            </h3>

            {/* Descrizione */}
            <p className="text-gray-600 line-clamp-3 leading-snug text-sm">
              {currentPost.excerpt || ""}
            </p>
          </div>
          {/* Footer con data e link */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 flex-shrink-0 mt-2 mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {formatDate(currentPost.publishedAt)}
              </span>
            </div>
            <Link
              to={`/posts/${currentPost.slug}`}
              className="text-blue-600 font-semibold text-xs hover:text-blue-700 transition-colors flex items-center gap-1"
            >
              Leggi
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <button
          onClick={prevPost}
          className="absolute left-2 top-1/3 -translate-y-1/2 bg-white/90 hover:bg-white p-2 shadow-lg transition-all z-10"
          aria-label="Articolo precedente"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <button
          onClick={nextPost}
          className="absolute right-2 top-1/3 -translate-y-1/2 bg-white/90 hover:bg-white p-2 shadow-lg transition-all z-10"
          aria-label="Articolo successivo"
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>
      </div>
      {posts.length > 1 && (
        <div className="flex justify-center gap-2 py-2 flex-shrink-0">
          {posts.slice(0, 5).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-blue-500 w-6"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Vai all'articolo ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
