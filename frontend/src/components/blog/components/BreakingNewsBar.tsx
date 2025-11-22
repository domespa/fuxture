import { useState, useEffect } from "react";
import type { NewsArticle } from "@/types/news.types";

export default function BreakingNewsBar() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

  // FETCH
  const fetchBreakingNews = async () => {
    try {
      const response = await fetch(`${API_URL}/breaking-news`);
      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();

      if (data.articles && data.articles.length > 0) {
        setNews(data.articles);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching breaking news:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBreakingNews();
  }, []);

  useEffect(() => {
    if (news.length === 0) return;

    const interval = setInterval(() => {
      setIsExiting(true);

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % news.length);
        setIsExiting(false);
      }, 500);
    }, 10000);

    return () => clearInterval(interval);
  }, [news.length]);

  if (isLoading || news.length === 0) {
    return null;
  }

  const currentNews = news[currentIndex];

  return (
    <div
      className="w-full overflow-hidden"
      style={{ backgroundColor: "#1F2937" }}
    >
      <div className="flex items-center gap-4 px-6 py-3">
        {/* Badge BREAKING NEWS */}
        <div className="flex-shrink-0 flex items-center gap-2 bg-red-600 px-3 py-1 rounded">
          <span className="text-red-600 text-xs animate-pulse">🔴</span>
          <span className="text-white font-bold text-xs uppercase tracking-wide">
            Breaking News
          </span>
        </div>

        {/* Contenuto News */}
        <div className="flex-1 min-w-0 overflow-hidden relative">
          <div
            key={currentIndex}
            className={`transform transition-all duration-500 ease-out ${
              isExiting
                ? "opacity-0 -translate-x-full"
                : "opacity-100 translate-x-0"
            }`}
            style={{
              animation: isExiting ? "none" : "slideInFromRight 0.5s ease-out",
            }}
          >
            {/* Titolo */}
            <h3 className="text-white font-semibold text-sm leading-tight truncate">
              {currentNews.title}
            </h3>

            {/* Descrizione */}
            {currentNews.description && (
              <p className="text-gray-300 text-xs mt-1 leading-tight truncate">
                {currentNews.description.length > 120
                  ? `${currentNews.description.substring(0, 120)}...`
                  : currentNews.description}
              </p>
            )}
          </div>
        </div>

        {/* Indicatore posizione */}
        <div className="flex-shrink-0 flex items-center gap-1">
          {news.slice(0, 5).map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIndex ? "bg-white w-6" : "bg-gray-500 w-1.5"
              }`}
            />
          ))}
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
