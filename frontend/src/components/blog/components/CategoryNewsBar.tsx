import { useState, useEffect } from "react";
import { newsService } from "@/services/newsService";

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: {
    id: string;
    name: string;
  };
  urlToImage?: string;
}

interface CategoryNewsBarProps {
  category: string;
  categoryName: string;
  categoryIcon?: string;
  categoryColor?: string;
}

export const CategoryNewsBar = ({
  category,
  categoryName,
  categoryIcon = "📰",
  categoryColor = "#2563EB",
}: CategoryNewsBarProps) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  // FETCH NEWS CONTESTUALI
  const fetchCategoryNews = async () => {
    try {
      setIsLoading(true);
      const data = await newsService.fetchCategoryNews(category);
      if (data && data.length > 0) {
        setNews(data);
      }
    } catch (error) {
      console.error("Error fetching category news:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryNews();
  }, [category]);

  // AUTO-SLIDE
  useEffect(() => {
    if (news.length === 0) return;

    const interval = setInterval(() => {
      setIsExiting(true);

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % news.length);
        setIsExiting(false);
      }, 500);
    }, 8000);

    return () => clearInterval(interval);
  }, [news.length]);

  if (isLoading || news.length === 0) {
    return null;
  }

  const currentNews = news[currentIndex];

  if (!currentNews) {
    return null;
  }

  return (
    <div
      className="w-full overflow-hidden"
      style={{ backgroundColor: "#1F2937" }}
    >
      <div className="flex items-center gap-4 px-6 py-3">
        {/* Badge Categoria */}
        <div
          className="flex-shrink-0 flex items-center gap-2 px-3 py-1 rounded"
          style={{ backgroundColor: categoryColor }}
        >
          <span className="text-xs">{categoryIcon}</span>
          <span className="text-white font-bold text-xs uppercase tracking-wide">
            {categoryName}
          </span>
        </div>

        {/* Contenuto News */}
        <div className="flex-1 min-w-0 overflow-hidden relative">
          <a
            href={currentNews.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:opacity-80 transition-opacity"
          >
            <div
              key={currentIndex}
              className={`transform transition-all duration-500 ease-out ${
                isExiting
                  ? "opacity-0 -translate-x-full"
                  : "opacity-100 translate-x-0"
              }`}
              style={{
                animation: isExiting
                  ? "none"
                  : "slideInFromRight 0.5s ease-out",
              }}
            >
              {/* Titolo */}
              <h3 className="text-white font-semibold text-sm leading-tight truncate">
                {currentNews.title}
              </h3>

              {/* Descrizione + Fonte */}
              {currentNews.description && (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-gray-300 text-xs leading-tight truncate flex-1">
                    {currentNews.description.length > 100
                      ? `${currentNews.description.substring(0, 100)}...`
                      : currentNews.description}
                  </p>
                  <span className="text-gray-400 text-xs flex-shrink-0">
                    • {currentNews.source.name}
                  </span>
                </div>
              )}
            </div>
          </a>
        </div>

        {/* Indicatore posizione */}
        <div className="flex-shrink-0 flex items-center gap-1">
          {news.slice(0, 5).map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIndex ? "w-6" : "w-1.5"
              }`}
              style={{
                backgroundColor:
                  idx === currentIndex ? categoryColor : "#6B7280",
              }}
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
};
