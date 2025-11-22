export interface NewsSource {
  id: string | null;
  name: string;
}

export interface NewsArticle {
  source: NewsSource;
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

export interface NewsCache {
  data: NewsArticle[] | null;
  timestamp: number | null;
  category: string;
}
// ========================================
// BREAKING NEWS TYPES
// ========================================
export interface BreakingNewsResponse {
  articles: NewsArticle[];
  cached: boolean;
  lastUpdate: string;
  source: string;
  stale?: boolean;
  error?: string;
}
