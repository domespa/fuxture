import { Request, Response } from "express";
import axios from "axios";
import * as xml2js from "xml2js";

// Cache in-memory
interface BreakingNewsCache {
  data: any[] | null;
  timestamp: number | null;
}

const cache: BreakingNewsCache = {
  data: null,
  timestamp: null,
};

const CACHE_DURATION = 10 * 60 * 1000; // 10 MINUTI
const ANSA_RSS_URL = "https://www.ansa.it/sito/notizie/topnews/topnews_rss.xml";

// FETCH FEED ANSARSS
export const getBreakingNews = async (req: Request, res: Response) => {
  try {
    const now = Date.now();

    // CHECK SE CI SONO GIà I DATI
    if (
      cache.data &&
      cache.timestamp &&
      now - cache.timestamp < CACHE_DURATION
    ) {
      console.log("📰 Breaking News: Serving from cache");
      return res.json({
        articles: cache.data,
        cached: true,
        lastUpdate: new Date(cache.timestamp).toISOString(),
        source: "ANSA",
      });
    }

    console.log("📰 Breaking News: Fetching from ANSA RSS...");

    // FETCH
    const response = await axios.get(ANSA_RSS_URL, {
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NewsBot/1.0)",
      },
    });

    // PARSIAMO IL XML
    const parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: false,
    });

    const result = await parser.parseStringPromise(response.data);

    // PRENDIAMO I FEED
    const items = result.rss?.channel?.item || [];

    // CONVERTIAMO
    const articles = Array.isArray(items)
      ? items.slice(0, 10)
      : [items].slice(0, 10);

    const formattedArticles = articles.map((item: any) => ({
      source: {
        id: "ansa",
        name: "ANSA",
      },
      author: null,
      title: item.title || "Nessun titolo",
      description: item.description || null,
      url: item.link || "#",
      urlToImage: item.enclosure?.$ ? item.enclosure.$.url : null,
      publishedAt: item.pubDate || new Date().toISOString(),
      content: item.description || null,
    }));

    // REFRESHCACHE
    cache.data = formattedArticles;
    cache.timestamp = now;

    console.log(
      `✅ Breaking News: Cached ${formattedArticles.length} articles`
    );

    res.json({
      articles: formattedArticles,
      cached: false,
      lastUpdate: new Date(now).toISOString(),
      source: "ANSA",
    });
  } catch (error) {
    console.error("❌ Error fetching ANSA breaking news:", error);

    if (cache.data) {
      console.log("⚠️ Returning stale cache due to error");
      return res.json({
        articles: cache.data,
        cached: true,
        stale: true,
        lastUpdate: cache.timestamp
          ? new Date(cache.timestamp).toISOString()
          : null,
        source: "ANSA",
        error: "Failed to fetch fresh data, serving cached data",
      });
    }

    res.status(500).json({
      error: "Failed to fetch breaking news",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
