import { Request, Response } from "express";
import axios from "axios";
import * as xml2js from "xml2js";

interface NewsCache {
  data: any[] | null;
  timestamp: number | null;
}

const cache: Record<string, NewsCache> = {};

const CACHE_DURATION = 10 * 60 * 1000; // 10 MINUTI

// MULTI-SOURCE
const CATEGORY_RSS_FEEDS: Record<string, string[]> = {
  topnews: ["https://www.ansa.it/sito/notizie/topnews/topnews_rss.xml"],
  finanza: [
    "https://www.ansa.it/sito/notizie/economia/economia_rss.xml",
    "https://www.ilsole24ore.com/rss/finanza.xml",
    "https://www.repubblica.it/rss/economia/rss2.0.xml",
  ],
  tecnologia: [
    "https://www.ansa.it/sito/notizie/tecnologia/tecnologia_rss.xml",
    "https://www.hwupgrade.it/rss/news.xml",
    "https://feeds.feedburner.com/html/it",
  ],
  salute: [
    "https://www.ansa.it/canale_saluteebenessere/notizie/salute_rss.xml",
  ],
  sport: [
    "https://www.ansa.it/sito/notizie/sport/sport_rss.xml",
    "https://www.gazzetta.it/rss/home.xml",
  ],
  politica: ["https://www.ansa.it/sito/notizie/politica/politica_rss.xml"],
  mondo: ["https://www.ansa.it/sito/notizie/mondo/mondo_rss.xml"],
  cultura: ["https://www.ansa.it/sito/notizie/cultura/cultura_rss.xml"],
  assicurazioni: ["https://www.ansa.it/sito/notizie/economia/economia_rss.xml"],
  concorsi: ["https://www.ansa.it/sito/notizie/topnews/topnews_rss.xml"],
  risparmio: ["https://www.ansa.it/sito/notizie/economia/economia_rss.xml"],
};

// Keywords per filtrare
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  finanza: [
    "borsa",
    "tassi",
    "inflazione",
    "bce",
    "fed",
    "azioni",
    "mercati",
    "finanziario",
    "investimenti",
  ],
  assicurazioni: [
    "assicurazione",
    "assicurazioni",
    "polizza",
    "polizze",
    "rc auto",
    "rca",
    "kasko",
    "assicurativo",
    "ivass",
    "premio",
    "sinistro",
    "risarcimento",
    "copertura",
    "vita",
  ],
  concorsi: [
    "concorso",
    "concorsi",
    "bando",
    "bandi",
    "selezione",
    "posto pubblico",
    "graduatoria",
    "assunzione",
    "pubblica amministrazione",
    "ministero",
    "comune",
    "regione",
    "esame",
    "prova scritta",
  ],
  risparmio: [
    "risparmio",
    "risparmiare",
    "sconto",
    "sconti",
    "offerta",
    "offerte",
    "convenienza",
    "promozione",
    "cashback",
    "buono sconto",
    "prezzo basso",
    "investimento",
    "conto deposito",
  ],
};

const cleanTitle = (title: string): string => {
  if (!title) return "";

  let cleanedTitle = title
    .replace(/\s*[-–—]\s*[\w\s.]+\.(?:it|com|org|net)\s*$/i, "")
    .trim();

  // Rimuovi tag HTML se presenti
  cleanedTitle = cleanedTitle.replace(/<[^>]*>/g, "").trim();

  // Rimuovi entità HTML
  cleanedTitle = cleanedTitle
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");

  return cleanedTitle.trim();
};

const extractRealUrl = (url: string): string => {
  if (!url) return "";

  try {
    if (url.includes("news.google.com/rss/articles/")) {
      const match = url.match(/articles\/(.*?)(\?|$)/);
      if (match && match[1] && match[1].length < 100) {
        return url;
      }
    }

    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    return "";
  } catch (error) {
    return url;
  }
};

const parseRSSFeed = async (url: string): Promise<any[]> => {
  try {
    const response = await axios.get(url, {
      timeout: 8000,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0)",
      },
    });

    const parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: false,
    });

    const result = await parser.parseStringPromise(response.data);
    const items = result.rss?.channel?.item || result.feed?.entry || [];

    return Array.isArray(items) ? items : [items];
  } catch (error) {
    console.error(`❌ Error parsing feed ${url}:`, error);
    return [];
  }
};

const formatArticle = (item: any): any | null => {
  try {
    let title = "";
    let url = "";
    let description = "";
    let publishedAt = "";
    let sourceName = "Notizie";

    if (item.title && item.link && typeof item.link === "string") {
      title = typeof item.title === "object" ? item.title._ : item.title;
      url = item.link;
      description = item.description || item.contentSnippet || "";
      publishedAt = item.pubDate || new Date().toISOString();
      sourceName = item.source?._ || item.source || "ANSA";
    }
    // FORMATO GOOGLE NEWS
    else if (item.title) {
      title = typeof item.title === "object" ? item.title._ : item.title;

      if (Array.isArray(item.link)) {
        url = item.link[0]?.$ ? item.link[0].$.href : item.link[0];
      } else if (typeof item.link === "object" && item.link.$) {
        url = item.link.$.href;
      } else if (typeof item.link === "string") {
        url = item.link;
      } else if (item.id) {
        url = item.id;
      }

      description =
        typeof item.summary === "object" ? item.summary._ : item.summary || "";
      publishedAt = item.published || item.updated || new Date().toISOString();

      // NOMESOURCE
      if (item.source?.title) {
        sourceName =
          typeof item.source.title === "object"
            ? item.source.title._
            : item.source.title;
      } else {
        sourceName = "Google News";
      }
    } else {
      return null;
    }
    title = cleanTitle(title);
    url = extractRealUrl(url);

    // VALIDAZIONE URL
    if (!url || url.length < 10 || !url.startsWith("http")) {
      console.log(`⚠️ Invalid URL skipped: ${url}`);
      return null;
    }

    // URK TROPPO LUNGHI
    if (url.includes("news.google.com") && url.length > 200) {
      console.log(`⚠️ Malformed Google News URL skipped (too long)`);
      return null;
    }

    // VALIDAZIONE TITOLO
    if (!title || title.length < 10) {
      console.log(`⚠️ Invalid title skipped: ${title}`);
      return null;
    }

    return {
      source: {
        id: sourceName.toLowerCase().replace(/\s+/g, "-"),
        name: sourceName,
      },
      author: null,
      title: title,
      description: description || title.substring(0, 150) + "...",
      url: url,
      urlToImage: item.enclosure?.$ ? item.enclosure.$.url : null,
      publishedAt: publishedAt,
      content: description || null,
    };
  } catch (error) {
    console.error("❌ Error formatting article:", error);
    return null;
  }
};

const fetchMultiSourceNews = async (urls: string[]): Promise<any[]> => {
  const allArticles: any[] = [];
  const results = await Promise.allSettled(
    urls.map((url) => parseRSSFeed(url))
  );

  results.forEach((result, index) => {
    if (result.status === "fulfilled" && result.value.length > 0) {
      console.log(
        `✅ Fetched ${result.value.length} items from source ${index + 1}`
      );

      const formattedArticles = result.value
        .map((item) => formatArticle(item))
        .filter((article) => article !== null && article.url && article.title); // ✅ Filtra invalidi

      console.log(
        `✅ Valid articles from source ${index + 1}: ${
          formattedArticles.length
        }`
      );

      allArticles.push(...formattedArticles);
    } else if (result.status === "rejected") {
      console.error(`❌ Source ${index + 1} failed:`, result.reason);
    }
  });

  // NO DUPLICATI
  const uniqueArticles = allArticles.filter(
    (article, index, self) =>
      index ===
      self.findIndex(
        (a) =>
          a.title.toLowerCase().trim() === article.title.toLowerCase().trim()
      )
  );

  console.log(`✅ Total unique articles: ${uniqueArticles.length}`);

  // SORT BY DATA
  uniqueArticles.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return uniqueArticles;
};

const filterArticlesByKeywords = (
  articles: any[],
  keywords: string[]
): any[] => {
  if (!keywords || keywords.length === 0) {
    return articles;
  }

  return articles.filter((article) => {
    const text = `${article.title} ${article.description}`.toLowerCase();
    return keywords.some((keyword) => text.includes(keyword.toLowerCase()));
  });
};

export const getBreakingNews = async (req: Request, res: Response) => {
  try {
    const now = Date.now();
    const cacheKey = "topnews";

    if (
      cache[cacheKey]?.data &&
      cache[cacheKey]?.timestamp &&
      now - cache[cacheKey].timestamp! < CACHE_DURATION
    ) {
      console.log("📰 Breaking News: Serving from cache");
      return res.json({
        articles: cache[cacheKey].data,
        cached: true,
        lastUpdate: new Date(cache[cacheKey].timestamp!).toISOString(),
        source: "Multi-Source",
      });
    }

    console.log("📰 Breaking News: Fetching from multiple sources...");

    const urls = CATEGORY_RSS_FEEDS.topnews;
    const articles = await fetchMultiSourceNews(urls);
    const topArticles = articles.slice(0, 10);

    cache[cacheKey] = {
      data: topArticles,
      timestamp: now,
    };

    console.log(
      `✅ Breaking News: Cached ${topArticles.length} articles from ${urls.length} sources`
    );

    res.json({
      articles: topArticles,
      cached: false,
      lastUpdate: new Date(now).toISOString(),
      source: "Multi-Source",
    });
  } catch (error) {
    console.error("❌ Error fetching breaking news:", error);

    const cacheKey = "topnews";
    if (cache[cacheKey]?.data) {
      console.log("⚠️ Returning stale cache due to error");
      return res.json({
        articles: cache[cacheKey].data,
        cached: true,
        stale: true,
        lastUpdate: cache[cacheKey].timestamp
          ? new Date(cache[cacheKey].timestamp!).toISOString()
          : null,
        source: "Multi-Source",
        error: "Failed to fetch fresh data, serving cached data",
      });
    }

    res.status(500).json({
      error: "Failed to fetch breaking news",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getCategoryNews = async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const now = Date.now();

    console.log(`📰 Received request for category: ${category}`);

    const urls = CATEGORY_RSS_FEEDS[category.toLowerCase()];
    if (!urls || urls.length === 0) {
      console.log(`❌ Category not found: ${category}`);
      return res.status(404).json({
        error: "Category not found",
        availableCategories: Object.keys(CATEGORY_RSS_FEEDS),
      });
    }

    const cacheKey = category.toLowerCase();

    if (
      cache[cacheKey]?.data &&
      cache[cacheKey]?.timestamp &&
      now - cache[cacheKey].timestamp! < CACHE_DURATION
    ) {
      console.log(`📰 ${category}: Serving from cache`);
      return res.json({
        articles: cache[cacheKey].data,
        cached: true,
        category: category,
        lastUpdate: new Date(cache[cacheKey].timestamp!).toISOString(),
        source: "Multi-Source",
      });
    }

    console.log(`📰 ${category}: Fetching from ${urls.length} sources...`);

    let articles = await fetchMultiSourceNews(urls);

    console.log(`✅ ${category}: Got ${articles.length} total articles`);

    const keywords = CATEGORY_KEYWORDS[cacheKey];
    if (keywords && keywords.length > 0) {
      const beforeFilter = articles.length;
      articles = filterArticlesByKeywords(articles, keywords);
      console.log(
        `🔍 ${category}: Filtered from ${beforeFilter} to ${articles.length} articles`
      );
    }

    if (articles.length < 5) {
      console.log(
        `⚠️ Not enough filtered articles for ${category}, using general articles`
      );
      articles = await fetchMultiSourceNews(urls);
    }

    const topArticles = articles.slice(0, 10);

    cache[cacheKey] = {
      data: topArticles,
      timestamp: now,
    };

    console.log(`✅ ${category}: Cached ${topArticles.length} articles`);

    res.json({
      articles: topArticles,
      cached: false,
      category: category,
      lastUpdate: new Date(now).toISOString(),
      source: "Multi-Source",
      totalSources: urls.length,
    });
  } catch (error) {
    console.error(`❌ Error fetching ${req.params.category} news:`, error);

    const cacheKey = req.params.category.toLowerCase();
    if (cache[cacheKey]?.data) {
      console.log("⚠️ Returning stale cache due to error");
      return res.json({
        articles: cache[cacheKey].data,
        cached: true,
        stale: true,
        category: req.params.category,
        lastUpdate: cache[cacheKey].timestamp
          ? new Date(cache[cacheKey].timestamp!).toISOString()
          : null,
        source: "Multi-Source",
        error: "Failed to fetch fresh data, serving cached data",
      });
    }

    res.status(500).json({
      error: "Failed to fetch category news",
      category: req.params.category,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getAvailableCategories = async (req: Request, res: Response) => {
  res.json({
    categories: Object.keys(CATEGORY_RSS_FEEDS),
  });
};
