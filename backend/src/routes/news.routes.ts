import express, { Request, Response } from "express";
import fetch from "node-fetch";
import {
  NewsSource,
  NewsArticle,
  NewsAPIResponse,
  NewsCache,
} from "../types/news.types";

const router = express.Router();

// CACHE IN MEMORIA COSI LIMITIAMO LE CHIAMATE
let newsCache: NewsCache = {
  data: null,
  timestamp: null,
  category: "general",
};

const CACHE_DURATION = 15 * 60 * 1000;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

// CATEGORIE DISPONIBILI
const categories: string[] = [
  "general",
  "business",
  "technology",
  "sports",
  "entertainment",
  "health",
  "science",
];

// FUNZIONE PER PRENDERLE RANDOM
const getRandomCategory = (): string => {
  return categories[Math.floor(Math.random() * categories.length)];
};

// NOMI IN ITALIANO
const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    general: "Generali",
    business: "Economia",
    technology: "Tecnologia",
    sports: "Sport",
    entertainment: "Intrattenimento",
    health: "Salute",
    science: "Scienza",
  };
  return labels[category] || "Notizie";
};
// ====================================================================================================== //
//                                   PUBLIC ROUTES
// ====================================================================================================== //
// PRINCIPALE
// GET /news
router.get("/news", async (req: Request, res: Response) => {
  try {
    const now = Date.now();

    // CHECK CACHE
    if (
      newsCache.data &&
      newsCache.timestamp &&
      now - newsCache.timestamp < CACHE_DURATION
    ) {
      console.log(
        `📰 Serving news from CACHE (${newsCache.data.length} articles)`
      );

      return res.json({
        articles: newsCache.data,
        category: newsCache.category,
        categoryLabel: getCategoryLabel(newsCache.category),
        cached: true,
        lastUpdate: new Date(newsCache.timestamp).toISOString(),
        nextUpdate: new Date(
          newsCache.timestamp + CACHE_DURATION
        ).toISOString(),
      });
    }

    // FETCH FRESH NEWS
    console.log("🔄 Fetching fresh news from NewsAPI...");

    if (!NEWS_API_KEY) {
      throw new Error("NEWS_API_KEY non configurata nel .env");
    }

    // CALCOLA DATA 7 GIORNI FA
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fromDate = sevenDaysAgo.toISOString().split("T")[0];

    const apiUrl = `https://newsapi.org/v2/everything?q=(italia OR italy OR italian) AND NOT (bitcoin OR crypto)&language=it&from=${fromDate}&sortBy=publishedAt&pageSize=10&apiKey=${NEWS_API_KEY}`;

    console.log(`🔗 Fetching Italian news from last 7 days...`);

    const response = await fetch(apiUrl);

    if (!response.ok) {
      if (response.status === 426) {
        throw new Error("Limite richieste API raggiunto");
      }
      if (response.status === 401) {
        throw new Error("API Key non valida");
      }
      throw new Error(`NewsAPI error: ${response.status}`);
    }

    const data = (await response.json()) as NewsAPIResponse;

    console.log(
      `📊 NewsAPI Response: ${
        data.articles?.length || 0
      } articles, totalResults: ${data.totalResults || 0}`
    );

    if (!data.articles || data.articles.length === 0) {
      // FALLBACK QUELLI VECCHI SE NON NE TROVA
      if (newsCache.data && newsCache.data.length > 0) {
        console.log("⚠️ No new articles, serving stale cache");
        return res.json({
          articles: newsCache.data,
          category: newsCache.category,
          categoryLabel: getCategoryLabel(newsCache.category),
          cached: true,
          stale: true,
          lastUpdate: newsCache.timestamp
            ? new Date(newsCache.timestamp).toISOString()
            : null,
        });
      }

      // NN
      return res.json({
        articles: [],
        category: "general",
        categoryLabel: "Generali",
        cached: false,
        lastUpdate: new Date(now).toISOString(),
        message: "Nessun articolo disponibile al momento",
      });
    }

    // FILTRA SOLO ARTICOLI VALIDI E RECENTI
    const validArticles = data.articles
      .filter((article) => {
        // USA URL VALIDI
        if (!article.url || !article.url.startsWith("http")) return false;

        // USA DATA VALIDA
        const articleDate = new Date(article.publishedAt);
        const daysDiff = (now - articleDate.getTime()) / (1000 * 60 * 60 * 24);

        // ULTIMI 7 GIORNI
        return daysDiff <= 7;
      })
      .slice(0, 5);

    if (validArticles.length === 0) {
      console.log("⚠️ No valid recent articles found");

      // FALLNONNT
      if (newsCache.data && newsCache.data.length > 0) {
        return res.json({
          articles: newsCache.data,
          category: newsCache.category,
          categoryLabel: getCategoryLabel(newsCache.category),
          cached: true,
          stale: true,
          lastUpdate: newsCache.timestamp
            ? new Date(newsCache.timestamp).toISOString()
            : null,
        });
      }

      return res.json({
        articles: [],
        category: "general",
        categoryLabel: "Generali",
        cached: false,
        lastUpdate: new Date(now).toISOString(),
        message: "Nessun articolo recente disponibile",
      });
    }

    // SALVA IN CACHE
    newsCache = {
      data: validArticles,
      timestamp: now,
      category: "general",
    };

    console.log(
      `✅ News cached successfully (${newsCache.data?.length} articles)`
    );

    res.json({
      articles: newsCache.data,
      category: newsCache.category,
      categoryLabel: getCategoryLabel(newsCache.category),
      cached: false,
      lastUpdate: new Date(now).toISOString(),
      nextUpdate: new Date(now + CACHE_DURATION).toISOString(),
    });
  } catch (error) {
    console.error("❌ Error fetching news:", error);

    // FALLBACK A CACHE VECCHIA
    if (newsCache.data && newsCache.data.length > 0) {
      console.log("⚠️ Returning stale cache due to error");
      return res.json({
        articles: newsCache.data,
        category: newsCache.category,
        categoryLabel: getCategoryLabel(newsCache.category),
        cached: true,
        stale: true,
        error: error instanceof Error ? error.message : "Unknown error",
        lastUpdate: newsCache.timestamp
          ? new Date(newsCache.timestamp).toISOString()
          : null,
      });
    }

    // NESSUNA CACHE
    res.status(500).json({
      error: "Impossibile recuperare le notizie",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// STATO CACHE
// GET /news/status
router.get("/api/news/status", (req: Request, res: Response) => {
  const now = Date.now();
  const cacheAge = newsCache.timestamp ? now - newsCache.timestamp : null;
  const isValid = cacheAge ? cacheAge < CACHE_DURATION : false;

  res.json({
    hasCache: !!newsCache.data,
    cacheValid: isValid,
    cacheAge: cacheAge ? Math.floor(cacheAge / 1000) + " seconds" : null,
    category: newsCache.category,
    articlesCount: newsCache.data ? newsCache.data.length : 0,
    lastUpdate: newsCache.timestamp
      ? new Date(newsCache.timestamp).toISOString()
      : null,
    nextRefresh: newsCache.timestamp
      ? new Date(newsCache.timestamp + CACHE_DURATION).toISOString()
      : null,
  });
});

// REFRESH
// POST /news/refresh
router.post("/api/news/refresh", async (req, res) => {
  console.log("🔄 Manual cache refresh requested");
  newsCache = { data: null, timestamp: null, category: "general" };
  res.json({
    success: true,
    message: "Cache cleared. Next request will fetch fresh news.",
  });
});

export default router;
// ====================================================================================================== //
// ====================================================================================================== //
