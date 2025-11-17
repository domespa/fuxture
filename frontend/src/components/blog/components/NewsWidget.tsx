import { useState, useEffect } from "react";
import { ExternalLink, Clock, Radio, Shuffle, RefreshCw } from "lucide-react";

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
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [currentCategory, setCurrentCategory] = useState<string>("Notizie");
  const [isCached, setIsCached] = useState(false);

  const API_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

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
        setCurrentCategory(data.categoryLabel);
        setIsCached(data.cached);
        setLastUpdate(new Date(data.lastUpdate));

        if (data.stale) {
          console.warn("⚠️ Using stale cache due to API error");
        }
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

    // Auto-refresh ogni 5 minuti (il backend ha cache 15 min)
    const interval = setInterval(fetchNews, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = (dateString: string): string => {
    const now = new Date().getTime();
    const published = new Date(dateString).getTime();
    const diffMinutes = Math.floor((now - published) / (1000 * 60));

    if (diffMinutes < 1) return "Ora";
    if (diffMinutes < 60) return `${diffMinutes} min fa`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24)
      return `${diffHours} ${diffHours === 1 ? "ora" : "ore"} fa`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ${diffDays === 1 ? "giorno" : "giorni"} fa`;
  };

  const getUpdateTimeAgo = (): string => {
    const now = new Date().getTime();
    const updated = lastUpdate.getTime();
    const diffMinutes = Math.floor((now - updated) / (1000 * 60));

    if (diffMinutes < 1) return "Aggiornato ora";
    if (diffMinutes === 1) return "Aggiornato 1 minuto fa";
    if (diffMinutes < 60) return `Aggiornato ${diffMinutes} minuti fa`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `Aggiornato ${diffHours} ${diffHours === 1 ? "ora" : "ore"} fa`;
  };

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
        <h3 className="text-red-800 font-bold mb-2">
          ⚠️ Errore caricamento news
        </h3>
        <p className="text-red-600 text-sm mb-3">{error}</p>
        <button
          onClick={fetchNews}
          className="text-sm text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Riprova
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg overflow-hidden border border-blue-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Radio className="w-6 h-6 animate-pulse" />
            <div>
              <h2 className="text-2xl font-bold">Ultime Notizie</h2>
              <p className="text-blue-100 text-sm flex items-center gap-1.5 mt-1">
                <Shuffle className="w-3.5 h-3.5" />
                {currentCategory}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-blue-100 text-sm">
            <Clock className="w-4 h-4" />
            <span>{getUpdateTimeAgo()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="inline-flex items-center gap-1.5 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
            <span className="w-2 h-2 bg-white rounded-full"></span>
            LIVE
          </span>
          <span className="text-blue-100 text-sm">
            News in tempo reale dall'Italia
            {isCached && (
              <span className="ml-2 opacity-70 text-xs">(cached)</span>
            )}
          </span>
        </div>
      </div>

      {/* News List */}
      <div className="p-6">
        {loading ? (
          // Loading Skeleton
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex gap-4">
                <div className="bg-gray-300 rounded-lg w-24 h-24 flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((article, index) => (
              <a
                key={index}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-4 p-4 bg-white rounded-lg hover:shadow-md transition-all duration-300 group border border-gray-100 hover:border-blue-300"
              >
                {/* Image */}
                {article.urlToImage ? (
                  <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={article.urlToImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 flex-shrink-0 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                    <Radio className="w-8 h-8 text-blue-500" />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                    {article.title}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="font-semibold text-blue-600">
                      {article.source.name}
                    </span>
                    <span>•</span>
                    <span>{getTimeAgo(article.publishedAt)}</span>
                    <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Footer */}
        {!loading && news.length > 0 && (
          <div className="mt-6 pt-4 border-t border-blue-100 flex justify-between items-center">
            <span className="text-xs text-gray-500 flex items-center gap-1.5">
              <Shuffle className="w-3.5 h-3.5" />
              Mix casuale di notizie
            </span>
            <button
              onClick={fetchNews}
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Aggiorna
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
