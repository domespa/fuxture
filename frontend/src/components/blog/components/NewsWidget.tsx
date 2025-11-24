import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  ExternalLink,
  Newspaper,
} from "lucide-react";

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

interface NewsResponse {
  articles: NewsArticle[];
  category: string;
  categoryLabel: string;
  cached: boolean;
  lastUpdate: string;
  stale?: boolean;
  error?: string;
}

export default function NewsWidget() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/news`);

      if (!response.ok) {
        throw new Error("Errore nel caricamento delle notizie");
      }

      const data: NewsResponse = await response.json();

      if (data.articles && data.articles.length > 0) {
        setNews(data.articles);
      } else {
        throw new Error("Nessuna notizia disponibile");
      }

      setLoading(false);
    } catch (err) {
      console.error("Errore fetch news:", err);
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Auto-slide ogni 5 secondi
  useEffect(() => {
    if (news.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [news.length]);

  const nextNews = () => {
    setCurrentIndex((prev) => (prev + 1) % news.length);
  };

  const prevNews = () => {
    setCurrentIndex((prev) => (prev - 1 + news.length) % news.length);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("it-IT", {
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
          onClick={fetchNews}
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
        <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <Newspaper className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Ultime Notizie</h2>
          </div>
        </div>
        <div className="h-[400px] flex items-center justify-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="bg-white shadow-lg p-8 text-center">
        <p className="text-gray-500">Nessuna notizia disponibile</p>
      </div>
    );
  }

  const currentArticle = news[currentIndex];

  return (
    <div className="bg-white shadow-lg overflow-hidden rounded-lg h-[600px] flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-2 text-white">
          <Newspaper className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Ultime Notizie</h2>
        </div>
      </div>

      {/* Slider Content */}
      <div className="relative flex-1 flex flex-col">
        {/* Immagine */}
        <div className="h-[250px] bg-gray-900 relative overflow-hidden flex-shrink-0">
          {currentArticle.urlToImage ? (
            <img
              key={currentIndex}
              src={currentArticle.urlToImage}
              alt={currentArticle.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <Newspaper className="w-16 h-16 text-white/30" />
            </div>
          )}
        </div>

        {/* Contenuto */}
        <div className="h-[250px] p-6 flex flex-col">
          {/* Fonte */}
          <div className="text-xs text-red-600 font-bold mb-2 flex-shrink-0">
            {currentArticle.source.name}
          </div>

          {/* Titolo */}
          <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 h-14 flex-shrink-0">
            {currentArticle.title}
          </h3>

          {/* Descrizione */}
          <p className="text-gray-600 text-sm mb-4 flex-1">
            {(currentArticle.description || "Nessuna descrizione disponibile")
              .length > 150
              ? `${currentArticle.description?.substring(0, 150)} . . .`
              : currentArticle.description || "Nessuna descrizione disponibile"}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500">
                {formatDate(currentArticle.publishedAt)}
              </span>
            </div>
            <a
              href={currentArticle.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 font-semibold text-sm hover:text-red-700 transition-colors flex items-center gap-1"
            >
              Leggi
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <button
          onClick={prevNews}
          className="absolute left-4 top-[125px] -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all z-10"
          aria-label="Notizia precedente"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={nextNews}
          className="absolute right-4 top-[125px] -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all z-10"
          aria-label="Notizia successiva"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Indicatori */}
      {news.length > 1 && (
        <div className="flex justify-center gap-2 py-4 flex-shrink-0 bg-white border-t">
          {news.slice(0, 5).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-red-500 w-8"
                  : "bg-gray-300 hover:bg-gray-400 w-2"
              }`}
              aria-label={`Vai alla notizia ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
