import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

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

export const newsService = {
  async fetchCategoryNews(category: string): Promise<NewsArticle[]> {
    try {
      const response = await axios.get(
        `${API_URL}/breaking-news/category/${category}`
      );
      return response.data.articles || [];
    } catch (error) {
      console.error("Error fetching category news:", error);
      return [];
    }
  },

  async fetchBreakingNews(): Promise<NewsArticle[]> {
    try {
      const response = await axios.get(`${API_URL}/breaking-news`);
      return response.data.articles || [];
    } catch (error) {
      console.error("Error fetching breaking news:", error);
      return [];
    }
  },

  async getAvailableCategories(): Promise<string[]> {
    try {
      const response = await axios.get(`${API_URL}/breaking-news/categories`);
      return response.data.categories || [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },
};
