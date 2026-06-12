import { useState, useEffect } from "react";
import { ExternalLink, Newspaper, RefreshCw } from "lucide-react";

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: { name: string };
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

  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/news`);
      if (!response.ok) throw new Error("Errore nel caricamento");
      const data: NewsResponse = await response.json();
      if (data.articles?.length > 0) {
        setNews(data.articles.slice(0, 8));
      } else {
        throw new Error("Nessuna notizia disponibile");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const formatDate = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    const diffM = Math.floor(diffMs / (1000 * 60));
    if (diffM < 60) return `${diffM}m fa`;
    if (diffH < 24) return `${diffH}h fa`;
    return date.toLocaleDateString("it-IT", { day: "2-digit", month: "short" });
  };

  if (error)
    return (
      <div className="nw-error">
        <p>⚠️ {error}</p>
        <button onClick={fetchNews} className="nw-retry">
          <RefreshCw size={13} /> Riprova
        </button>
      </div>
    );

  return (
    <div className="nw-wrap">
      <div className="nw-header">
        <Newspaper size={15} />
        <span>Dal mondo</span>
      </div>

      {loading ? (
        <div className="nw-feed">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="nw-ghost">
              <div className="nw-ghost__source" />
              <div className="nw-ghost__title" />
              <div className="nw-ghost__title nw-ghost__title--short" />
            </div>
          ))}
        </div>
      ) : (
        <div className="nw-feed">
          {news.map((article, i) => (
            <a
              key={i}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="nw-item"
            >
              <div className="nw-item__meta">
                <span className="nw-item__source">{article.source.name}</span>
                <span className="nw-item__time">
                  {formatDate(article.publishedAt)}
                </span>
              </div>
              <p className="nw-item__title">{article.title}</p>
              <ExternalLink size={11} className="nw-item__icon" />
            </a>
          ))}
        </div>
      )}

      <style>{`
        .nw-wrap {
          background: #fff;
          border-radius: 14px;
          border: 1.5px solid #E2E8F0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .nw-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 16px;
          background: #0B1120;
          color: rgba(255,255,255,0.7);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .nw-feed {
          overflow-y: auto;
          max-height: 480px;
          flex: 1;
        }
        .nw-feed::-webkit-scrollbar { width: 4px; }
        .nw-feed::-webkit-scrollbar-track { background: transparent; }
        .nw-feed::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 2px; }
        .nw-item {
          display: block;
          padding: 14px 16px;
          border-bottom: 1px solid #F1F5F9;
          text-decoration: none;
          transition: background 0.15s;
          position: relative;
        }
        .nw-item:last-child { border-bottom: none; }
        .nw-item:hover { background: #F8FAFC; }
        .nw-item__meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        .nw-item__source {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #4F46E5;
        }
        .nw-item__time {
          font-size: 10px;
          color: #94A3B8;
          font-weight: 500;
        }
        .nw-item__title {
          font-size: 13px;
          font-weight: 600;
          color: #1E293B;
          line-height: 1.45;
          margin: 0;
          padding-right: 18px;
        }
        .nw-item:hover .nw-item__title { color: #4F46E5; }
        .nw-item__icon {
          position: absolute;
          right: 16px;
          bottom: 14px;
          color: #CBD5E1;
          opacity: 0;
          transition: opacity 0.15s;
        }
        .nw-item:hover .nw-item__icon { opacity: 1; }

        /* Skeleton */
        .nw-ghost {
          padding: 14px 16px;
          border-bottom: 1px solid #F1F5F9;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .nw-ghost__source {
          height: 10px;
          width: 60px;
          background: #E2E8F0;
          border-radius: 4px;
          animation: nw-shimmer 1.4s ease-in-out infinite;
        }
        .nw-ghost__title {
          height: 12px;
          background: #E2E8F0;
          border-radius: 4px;
          animation: nw-shimmer 1.4s ease-in-out infinite;
        }
        .nw-ghost__title--short { width: 70%; }
        @keyframes nw-shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Error */
        .nw-error {
          padding: 24px;
          text-align: center;
          color: #EF4444;
          font-size: 13px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          align-items: center;
        }
        .nw-retry {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #fff;
          background: #EF4444;
          border: none;
          border-radius: 6px;
          padding: 6px 12px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
